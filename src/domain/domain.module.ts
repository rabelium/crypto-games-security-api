import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RegistrationHandler } from './handlers/registration.handler';
import { AuthenticateHandler } from './handlers/authenticate.handler';
import { RefreshHandler } from './handlers/refresh.handler';
import { VerifyHandler } from './handlers/verify.handler';
import { ProfileHandler } from './handlers/profile.handler';
import { ListUsersHandler } from './handlers/list-users.handler';
import { UpdateUserHandler } from './handlers/update-user.handler';
import { CreateUserHandler } from './handlers/create-user.handler';

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get<JwtModuleOptions>('jwt'),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthenticateHandler,
    RegistrationHandler,
    CreateUserHandler,
    UpdateUserHandler,
    ListUsersHandler,
    RefreshHandler,
    ProfileHandler,
    VerifyHandler,
  ],
})
export class DomainModule {}
