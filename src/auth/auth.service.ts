import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Request } from 'express';
import { VALID_NAME_REGEX } from '../common/common.constants';
import { ServerInvitesService } from '../server-invites/server-invites.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  MIN_PASSWORD_LENGTH,
  SALT_ROUNDS,
  VALID_EMAIL_REGEX,
} from './auth.constants';
import { AuthPayload } from './models/auth.payload';
import { LoginInput } from './models/login.input';
import { SignUpInput } from './models/sign-up.input';

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
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    const user = await this.validateUser(email, password);
    const access_token = await this.generateAccessToken(user.id);
    return { access_token };
  }

  async signUp({
    name,
    email,
    password,
    confirmPassword,
    inviteToken,
  }: SignUpInput): Promise<AuthPayload> {
    if (!VALID_EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email address');
    }
    if (!VALID_NAME_REGEX.test(name)) {
      throw new Error('User names cannot contain special characters');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('Password must be at least 12 characters long');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const users = await this.usersService.getUsers();
    if (users.length && !inviteToken) {
      throw new Error('Missing invite token');
    }
    if (inviteToken) {
      await this.serverInvitesService.getValidServerInvite(inviteToken);
    }

    const existingUser = await this.usersService.getUser({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hash(password, SALT_ROUNDS);
    const user = await this.usersService.createUser(name, email, passwordHash);

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
