import { UserInputError, ValidationError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ServerInvitesService } from '../server-invites/server-invites.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { RequestWithCookies } from './auth.types';
import { LoginInput } from './models/login.input';
import { SignUpInput } from './models/sign-up.input';
import { AccessTokenPayload } from './strategies/jwt.strategy';

const ACCESS_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 90;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private serverInvitesService: ServerInvitesService,
    private usersService: UsersService,
  ) {}

  async login({ email, password }: LoginInput) {
    const user = await this.validateUser(email, password);
    return this.generateAccessToken(user.id);
  }

  async signUp({
    inviteToken,
    password,
    confirmPassword,
    profilePicture,
    ...userData
  }: SignUpInput) {
    const users = await this.usersService.getUsers();
    if (users.length && !inviteToken) {
      throw new UserInputError('Missing invite token');
    }
    if (inviteToken) {
      await this.serverInvitesService.getValidServerInvite(inviteToken);
    }

    const existingUser = await this.usersService.getUser({
      email: userData.email,
    });
    if (existingUser) {
      throw new UserInputError('User already exists');
    }
    if (password !== confirmPassword) {
      throw new UserInputError('Passwords do not match');
    }

    const passwordHash = await hash(password, SALT_ROUNDS);
    const user = await this.usersService.createUser({
      password: passwordHash,
      ...userData,
    });

    if (profilePicture) {
      await this.usersService.saveProfilePicture(user.id, profilePicture);
    }
    if (inviteToken) {
      await this.serverInvitesService.redeemServerInvite(inviteToken);
    }

    return this.generateAccessToken(user.id);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.usersService.getUser({ email });
      if (!user) {
        throw new ValidationError('User not found');
      }

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        throw new ValidationError('Incorrect username or password');
      }

      const { password: _password, ...result } = user;
      return result;
    } catch (err) {
      throw new ValidationError(err);
    }
  }

  async generateAccessToken(userId: number) {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  getSub({ cookies }: RequestWithCookies) {
    const claims = cookies ? this.decodeToken(cookies.access_token) : null;
    return claims?.sub ? parseInt(claims.sub) : null;
  }

  decodeToken(token: string) {
    try {
      const jwtKey = this.configService.get('JWT_KEY');
      return verify(token, jwtKey) as JwtPayload;
    } catch {
      return null;
    }
  }
}
