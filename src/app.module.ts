import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import configuration from '@configuration/configuration';
import { ApplicationModule } from '@application/application.module';
import { DomainModule } from '@domain/domain.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { HttpExceptionFilter } from '@application/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    InfrastructureModule,
    ApplicationModule,
    DomainModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
