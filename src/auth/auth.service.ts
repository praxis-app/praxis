import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { ServerInvitesService } from '../server-invites/server-invites.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { AuthTokens } from './auth.types';
import { LoginInput } from './models/login.input';
import { SignUpInput } from './models/sign-up.input';
import { RefreshTokensService } from './refresh-tokens/refresh-tokens.service';
import { AccessTokenPayload } from './strategies/jwt.strategy';
import { UserInputError, ValidationError } from '@nestjs/apollo';

const ACCESS_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 90;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => RefreshTokensService))
    private refreshTokensService: RefreshTokensService,

    private jwtService: JwtService,
    private serverInvitesService: ServerInvitesService,
    private usersService: UsersService,
  ) {}

  async login({ email, password }: LoginInput) {
    const user = await this.validateUser(email, password);
    const authTokens = await this.generateAuthTokens(user.id);
    return authTokens;
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
    const authTokens = await this.generateAuthTokens(user.id);

    if (profilePicture) {
      await this.usersService.saveProfilePicture(user.id, profilePicture);
    }
    if (inviteToken) {
      await this.serverInvitesService.redeemServerInvite(inviteToken);
    }
    return authTokens;
  }

  async generateAuthTokens(userId: number): Promise<AuthTokens> {
    const access_token = await this.generateAccessToken(userId);
    const { refresh_token } =
      await this.refreshTokensService.generateRefreshToken(userId);
    return { access_token, refresh_token };
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
}
