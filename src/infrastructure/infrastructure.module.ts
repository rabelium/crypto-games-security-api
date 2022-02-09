import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { WalletHandler } from './handlers/wallet.handler';
import { UserHandler } from './handlers/user.handler';
import { entities, schemas } from './database';

@Module({
  imports: [
    CqrsModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get<SequelizeModuleOptions>('database'),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature(entities),
    MongooseModule.forRoot(
      'mongodb://cryptousr:cryptopwd@mongodb:27017/cryptogames?authSource=admin',
    ),
    MongooseModule.forFeature(schemas),
  ],
  providers: [UserHandler, WalletHandler],
})
export class InfrastructureModule {}
