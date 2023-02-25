import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserInputError, ValidationError } from "apollo-server-express";
import { compare, hash } from "bcrypt";
import { ServerInvitesService } from "../server-invites/server-invites.service";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { SetAuthCookieInput } from "./interceptors/set-auth-cookie.interceptor";
import { LoginInput } from "./models/login.input";
import { SignUpInput } from "./models/sign-up.input";
import { RefreshTokensService } from "./refresh-tokens/refresh-tokens.service";
import { AccessTokenPayload } from "./strategies/jwt.strategy";

const ACCESS_TOKEN_EXPIRES_IN = 15;
const SALT_ROUNDS = 10;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => RefreshTokensService))
    private refreshTokensService: RefreshTokensService,

    private jwtService: JwtService,
    private serverInvitesService: ServerInvitesService,
    private usersService: UsersService
  ) {}

  async login({ email, password }: LoginInput): Promise<SetAuthCookieInput> {
    const user = await this.validateUser(email, password);
    const authTokens = await this.generateAuthTokens(user.id);
    return { user, authTokens };
  }

  async signUp({
    password,
    inviteToken,
    ...userData
  }: SignUpInput): Promise<SetAuthCookieInput> {
    const serverInvite = await this.serverInvitesService.getServerInvite(
      inviteToken
    );
    const existingUser = await this.usersService.getUser({
      email: userData.email,
    });
    if (existingUser) {
      throw new UserInputError("User already exists");
    }

    const passwordHash = await hash(password, SALT_ROUNDS);
    const user = await this.usersService.createUser({
      password: passwordHash,
      ...userData,
    });
    const authTokens = await this.generateAuthTokens(user.id);

    // Redeem invite only after successful sign up
    await this.serverInvitesService.redeemServerInvite(serverInvite.id);

    return { user, authTokens };
  }

  async generateAuthTokens(userId: number): Promise<AuthTokens> {
    const access_token = await this.generateAccessToken(userId);
    const { refresh_token } =
      await this.refreshTokensService.generateRefreshToken(userId);
    return { access_token, refresh_token };
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<Omit<User, "password">> {
    try {
      const user = await this.usersService.getUser({ email });
      if (!user) {
        throw new ValidationError("User not found");
      }

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        throw new ValidationError("Incorrect username or password");
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
