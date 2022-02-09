import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationController } from './controllers/authentication.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserController } from './controllers/user.controller';
import { HealthController } from './controllers/health.controller';
import { JwtRefreshStrategy } from './strategies/jwt_refresh.strategy';

@Module({
  imports: [CqrsModule],
  controllers: [HealthController, AuthenticationController, UserController],
  providers: [JwtStrategy, JwtRefreshStrategy],
})
export class ApplicationModule {}
