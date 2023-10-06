import { UseInterceptors } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { RefreshTokenUser } from './decorators/refresh-token-user.decorator';
import { RefreshAuthCookieInterceptor } from './interceptors/refresh-auth-cookie.interceptor';
import { RefreshToken } from './models/refresh-token.model';
import { RefreshTokensService } from './refresh-tokens.service';

@Resolver(() => RefreshToken)
export class RefreshTokensResolver {
  constructor(private refreshTokensService: RefreshTokensService) {}

  @Mutation(() => Boolean)
  @UseInterceptors(RefreshAuthCookieInterceptor)
  async refreshToken(@RefreshTokenUser() user: User) {
    return this.refreshTokensService.refreshToken(user.id);
  }
}
