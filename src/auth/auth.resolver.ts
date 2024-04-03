import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { IpThrottlerGuard } from '../common/guards/ip-throttler.guard';
import { SynchronizeProposalsInterceptor } from '../proposals/interceptors/synchronize-proposals.interceptor';
import { User } from '../users/models/user.model';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';
import { ClearSiteDataInterceptor } from './interceptors/clear-site-data.interceptor';
import { AuthPayload } from './models/auth.payload';
import { LoginInput } from './models/login.input';
import { ResetPasswordInput } from './models/reset-password.input';
import { SignUpInput } from './models/sign-up.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => Boolean)
  @UseInterceptors(SynchronizeProposalsInterceptor)
  async authCheck() {
    return true;
  }

  @Query(() => Boolean)
  async isValidResetPasswordToken(@Args('token') token: string) {
    return this.authService.isValidResetPasswordToken(token);
  }

  @Mutation(() => AuthPayload)
  @UseGuards(LoginThrottlerGuard, IpThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 * 10 } })
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload)
  async signUp(@Args('input') input: SignUpInput) {
    return this.authService.signUp(input);
  }

  @Mutation(() => AuthPayload)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
    @CurrentUser() currentUser?: User,
  ) {
    return this.authService.resetPassword(input, currentUser);
  }

  @Mutation(() => Boolean)
  async sendPasswordReset(@Args('email') email: string) {
    return this.authService.sendForgotPasswordEmail(email);
  }

  @Mutation(() => Boolean)
  @UseInterceptors(ClearSiteDataInterceptor)
  async logOut() {
    return true;
  }
}
