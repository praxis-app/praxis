import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { GqlThrottlerGuard } from '../common/guards/gql-throttler.guard';
import { SynchronizeProposalsInterceptor } from '../proposals/interceptors/synchronize-proposals.interceptor';
import { AuthService } from './auth.service';
import { ClearSiteDataInterceptor } from './interceptors/clear-site-data.interceptor';
import { AuthPayload } from './models/auth.payload';
import { LoginInput } from './models/login.input';
import { SignUpInput } from './models/sign-up.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 * 10 } })
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload)
  async signUp(@Args('input') input: SignUpInput) {
    return this.authService.signUp(input);
  }

  @Mutation(() => Boolean)
  @UseInterceptors(ClearSiteDataInterceptor)
  async logOut() {
    return true;
  }

  @Query(() => Boolean)
  @UseInterceptors(SynchronizeProposalsInterceptor)
  async authCheck() {
    return true;
  }
}
