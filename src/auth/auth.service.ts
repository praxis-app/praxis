import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Request } from 'express';
import { ServerInvitesService } from '../server-invites/server-invites.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { AuthPayload } from './models/auth.payload';
import { LoginInput } from './models/login.input';
import { SignUpInput } from './models/sign-up.input';

const ACCESS_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 90;
const SALT_ROUNDS = 10;

export interface AccessTokenPayload {
  /**
   * Identifies the user or subject of the JWT
   * https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2
   */
  sub: number;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private serverInvitesService: ServerInvitesService,
    private usersService: UsersService,
  ) {}

  async login({ email, password }: LoginInput): Promise<AuthPayload> {
    const user = await this.validateUser(email, password);
    const access_token = await this.generateAccessToken(user.id);
    return { access_token };
  }

  async signUp({
    inviteToken,
    password,
    confirmPassword,
    profilePicture,
    ...userData
  }: SignUpInput): Promise<AuthPayload> {
    const users = await this.usersService.getUsers();
    if (users.length && !inviteToken) {
      throw new Error('Missing invite token');
    }
    if (inviteToken) {
      await this.serverInvitesService.getValidServerInvite(inviteToken);
    }

    const existingUser = await this.usersService.getUser({
      email: userData.email,
    });
    if (existingUser) {
      throw new Error('User already exists');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const passwordHash = await hash(password, SALT_ROUNDS);
    const user = await this.usersService.createUser({
      password: passwordHash,
      ...userData,
    });

    if (profilePicture) {
      // TODO: Move this to createUser method
      await this.usersService.saveProfilePicture(user.id, profilePicture);
    }
    if (inviteToken) {
      await this.serverInvitesService.redeemServerInvite(inviteToken);
    }

    const access_token = await this.generateAccessToken(user.id);
    return { access_token };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.usersService.getUser({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Incorrect username or password');
      }

      const { password: _password, ...result } = user;
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async generateAccessToken(userId: number) {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  async getSub(
    request: Request | undefined,
    connectionParams: { authorization: string } | undefined,
  ) {
    const authorization =
      request?.headers.authorization || connectionParams?.authorization;

    const [type, token] = authorization?.split(' ') ?? [];
    const payload = await this.decodeToken(token);
    if (type !== 'Bearer' || !payload) {
      return null;
    }
    return payload.sub;
  }

  async decodeToken(token: string) {
    try {
      const jwtKey = this.configService.get('JWT_KEY');
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        { secret: jwtKey },
      );
      return payload;
    } catch {
      return null;
    }
  }
}
