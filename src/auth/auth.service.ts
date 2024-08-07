// TODO: Extract email templates as util functions

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import * as cryptoRandomString from 'crypto-random-string';
import { Request } from 'express';
import { MoreThan, Repository } from 'typeorm';
import { VALID_NAME_REGEX } from '../common/common.constants';
import { normalizeText } from '../common/common.utils';
import { ServerInvitesService } from '../server-invites/server-invites.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  SALT_ROUNDS,
  VALID_EMAIL_REGEX,
} from './auth.constants';
import { AuthPayload } from './models/auth.payload';
import { LoginInput } from './models/login.input';
import { ResetPasswordInput } from './models/reset-password.input';
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
    private mailerService: MailerService,
    private serverInvitesService: ServerInvitesService,
    private usersService: UsersService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login({ email, password }: LoginInput): Promise<AuthPayload> {
    const user = await this.validateLogin(email, password);
    const access_token = await this.generateAccessToken(user.id);
    return { access_token, isVerified: user.verified };
  }

  async signUp(input: SignUpInput): Promise<AuthPayload> {
    await this.validateSignUp(input);

    const { name, email, password, inviteToken } = input;
    const passwordHash = await hash(password, SALT_ROUNDS);
    const user = await this.usersService.createUser(name, email, passwordHash);

    if (inviteToken) {
      await this.serverInvitesService.redeemServerInvite(inviteToken);
    }

    const access_token = await this.generateAccessToken(user.id);
    return { access_token, isVerified: user.verified };
  }

  async resetPassword(
    input: ResetPasswordInput,
    currentUser?: User,
  ): Promise<AuthPayload> {
    const { password, confirmPassword, resetPasswordToken } = input;
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('Password must be at least 12 characters long');
    }
    if (!currentUser && !resetPasswordToken) {
      throw new Error('Missing password reset token');
    }

    const where = currentUser ? { id: currentUser.id } : { resetPasswordToken };
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      throw new Error('Password could not be reset');
    }

    const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
    if (!currentUser && user.resetPasswordSentAt! < twoDaysAgo) {
      throw new Error('Password reset token has expired');
    }

    const passwordHash = await hash(password, SALT_ROUNDS);
    await this.userRepository.update(user.id, {
      password: passwordHash,
      resetPasswordToken: null,
      resetPasswordSentAt: null,
      locked: false,
    });

    const access_token = await this.generateAccessToken(user.id);
    return { access_token, isVerified: user.verified };
  }

  async sendForgotPasswordEmail(email: string) {
    if (!VALID_EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email address');
    }
    const user = await this.usersService.getUser({
      email: normalizeText(email),
    });
    if (!user) {
      return true;
    }

    const resetPasswordToken = cryptoRandomString({ length: 32 });
    await this.userRepository.update(user.id, {
      resetPasswordSentAt: new Date(),
      resetPasswordToken,
    });

    const mailSender = this.configService.get('MAIL_ADDRESS');
    const websiteUrl = this.configService.get('WEBSITE_URL');
    await this.mailerService.sendMail({
      to: user.email,
      from: mailSender,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Helvetica">
          <p>Hello,</p>
        
          <p>
            We've received a request to reset the password for your account. Please note
            that this link will expire in 24 hours.
          </p>
        
          <p>To reset your password, simply click the link below:</p>
        
          <a href="${websiteUrl}/auth/reset-password/${resetPasswordToken}">
            ${websiteUrl}/auth/reset-password/${resetPasswordToken}
          </a>
        
          <p>
            If you did not request this password reset or believe this action was taken
            in error, kindly inform us by replying to this email.
          </p>
        
          <p>
            Thank you,<br />
            <a href="${websiteUrl}">${websiteUrl}</a>
          </p>
        </div>
      `,
    });

    return true;
  }

  async sendAccountLockedEmail(user: User) {
    const resetPasswordToken = cryptoRandomString({ length: 32 });
    await this.userRepository.update(user.id, {
      resetPasswordSentAt: new Date(),
      resetPasswordToken,
    });

    const mailSender = this.configService.get('MAIL_ADDRESS');
    const websiteUrl = this.configService.get('WEBSITE_URL');
    await this.mailerService.sendMail({
      to: user.email,
      from: mailSender,
      subject: 'Your account has been locked',
      html: `
        <div style="font-family: Helvetica">
          <p>Hello,</p>
        
          <p>
            We've noticed that there have been too many failed login attempts on your
            account. To ensure the security of your account, we've temporarily locked
            it.
          </p>
        
          <p>To reset your password, simply click the link below:</p>
        
          <a href="${websiteUrl}/auth/reset-password/${resetPasswordToken}">
            ${websiteUrl}/auth/reset-password/${resetPasswordToken}
          </a>
        
          <p>
            If you were not the one who attempted to login or believe this action was
            taken in error, kindly inform us by replying to this email.
          </p>
        
          <p>
            Thank you,<br />
            <a href="${websiteUrl}">${websiteUrl}</a>
          </p>
        </div>
      `,
    });
  }

  async isValidResetPasswordToken(token: string) {
    const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
    const userCount = await this.userRepository.count({
      where: {
        resetPasswordToken: token,
        resetPasswordSentAt: MoreThan(twoDaysAgo),
      },
    });
    return userCount > 0;
  }

  async getSubClaim(
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

  private async validateLogin(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    const normalizedEmail = normalizeText(email);
    const user = await this.usersService.getUser({ email: normalizedEmail });
    if (!user || user.locked) {
      throw new Error('Incorrect username or password');
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Incorrect username or password');
    }

    const { password: _password, ...result } = user;
    return result;
  }

  private async validateSignUp({
    name,
    email,
    password,
    confirmPassword,
    inviteToken,
  }: SignUpInput) {
    if (!VALID_EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email address');
    }
    if (email.length > 254) {
      throw new Error('Email address cannot exceed 254 characters');
    }
    if (!VALID_NAME_REGEX.test(name)) {
      throw new Error('User names cannot contain special characters');
    }
    if (name.length < 2) {
      throw new Error('Username must be at least 2 characters');
    }
    if (name.length > 15) {
      throw new Error('Username cannot exceed 15 characters');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      throw new Error(
        `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
      );
    }

    const users = await this.usersService.getUsers();
    if (users.length && !inviteToken) {
      throw new Error('Missing invite token');
    }
    if (inviteToken) {
      await this.serverInvitesService.getValidServerInvite(inviteToken);
    }

    const usersWithEmailCount = await this.usersService.getUsersCount({
      email: normalizeText(email),
    });
    if (usersWithEmailCount > 0) {
      throw new Error('Email address is already in use');
    }

    const usersWithNameCount = await this.usersService.getUsersCount({ name });
    if (usersWithNameCount > 0) {
      throw new Error('Username is already in use');
    }
  }

  private async generateAccessToken(userId: number) {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private async decodeToken(token: string) {
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
