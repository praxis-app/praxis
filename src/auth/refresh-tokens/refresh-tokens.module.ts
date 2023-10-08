import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../users/users.module';
import { AuthModule } from '../auth.module';
import { RefreshToken } from './models/refresh-token.model';
import { RefreshTokensResolver } from './refresh-tokens.resolver';
import { RefreshTokensService } from './refresh-tokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    forwardRef(() => AuthModule),
    UsersModule,
  ],
  providers: [RefreshTokensService, RefreshTokensResolver],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
