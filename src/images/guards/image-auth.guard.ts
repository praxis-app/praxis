import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccessTokenPayload } from '../../auth/auth.service';
import { PostsService } from '../../posts/posts.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ImageAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const isLoggedIn = await this.isLoggedIn(request);
    const isPublicImage = await this.isPublicImage(request);

    if (!isLoggedIn && !isPublicImage) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private async isLoggedIn(request: Request) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.configService.get('JWT_KEY'),
        },
      );
      const user = await this.usersService.getUser({ id: payload.sub });
      return !!user;
    } catch {
      return false;
    }
  }

  private async isPublicImage({ params }: Request) {
    const imageId = parseInt(params.id);
    const isPublicPostImage =
      await this.postsService.isPublicPostImage(imageId);

    return isPublicPostImage;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
