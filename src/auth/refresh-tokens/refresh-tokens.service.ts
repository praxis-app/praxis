import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenExpiredError } from 'jsonwebtoken';
import { Not, Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { AuthTokens } from '../auth.types';
import { RefreshToken } from './models/refresh-token.model';

const REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 7;

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private repository: Repository<RefreshToken>,

    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,

    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async refreshToken(userId: number): Promise<AuthTokens> {
    const access_token = await this.authService.generateAccessToken(userId);

    // Implements refresh token rotation - a new refresh token is issed on every refresh
    const { refresh_token, id } = await this.generateRefreshToken(userId);

    // Revokes all refresh tokens for the user, other than the one just created
    await this.revokeAllOtherRefreshTokensForUser(id, userId);

    return { access_token, refresh_token };
  }

  async validateRefreshToken(id: number, userId: number) {
    try {
      const token = await this.repository.findOne({ where: { id } });
      if (!token) {
        return 'Refresh token not found';
      }

      if (token.revoked) {
        /**
         * Helps to prevent Replay Attacks
         * https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
         */
        await this.revokeAllRefreshTokensForUser(userId);

        return 'Refresh token revoked';
      }

      const user = await this.usersService.getUser({ id: userId });
      if (!user) {
        return 'Refresh token malformed';
      }

      return true;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return 'Refresh token expired';
      } else {
        return err.message as string;
      }
    }
  }

  async generateRefreshToken(userId: number) {
    const { id } = await this.createRefreshToken(userId);
    const payload = { jti: id, sub: userId };
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    return { refresh_token, id };
  }

  async createRefreshToken(userId: number) {
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + REFRESH_TOKEN_EXPIRES_IN);
    return this.repository.save({ expiresAt, userId });
  }

  async revokeAllRefreshTokensForUser(userId: number) {
    await this.repository.update(
      { userId },
      {
        revoked: true,
      },
    );
  }

  async revokeAllOtherRefreshTokensForUser(
    refreshTokenId: number,
    userId: number,
  ) {
    await this.repository.update(
      { id: Not(refreshTokenId), userId },
      {
        revoked: true,
      },
    );
  }
}
