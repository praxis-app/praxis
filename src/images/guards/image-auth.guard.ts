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
import { UsersService } from '../../users/users.service';
import { ImagesService } from '../images.service';

@Injectable()
export class ImageAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private imagesService: ImagesService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const imageId = parseInt(request.params.id);

    const isLoggedIn = await this.isLoggedIn(token);
    const isPublicImage = await this.imagesService.isPublicImage(imageId);

    if (!isLoggedIn && !isPublicImage) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private async isLoggedIn(token: string | undefined) {
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

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
