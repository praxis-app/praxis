import { UseInterceptors } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { ClearAuthCookieInterceptor } from "./interceptors/clear-auth-cookie.interceptor";
import { SetAuthCookieInterceptor } from "./interceptors/set-auth-cookie.interceptor";
import { LoginInput } from "./models/login.input";
import { LoginPayload } from "./models/login.payload";
import { SignUpInput } from "./models/sign-up.input";
import { SignUpPayload } from "./models/sign-up.payload";

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginPayload)
  @UseInterceptors(SetAuthCookieInterceptor)
  async login(@Args("input") input: LoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => SignUpPayload)
  @UseInterceptors(SetAuthCookieInterceptor)
  async signUp(@Args("input") input: SignUpInput) {
    return this.authService.signUp(input);
  }

  @Mutation(() => Boolean)
  @UseInterceptors(ClearAuthCookieInterceptor)
  async logOut() {
    return true;
  }

  @Query(() => Boolean)
  async authCheck() {
    return true;
  }
}
