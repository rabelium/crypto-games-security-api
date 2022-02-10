import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { WalletHandler } from './handlers/wallet.handler';
import { UserHandler } from './handlers/user.handler';
import { schemas } from './database';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forRoot(
      'mongodb://cryptousr:cryptopwd@mongodb:27017/cryptogames?authSource=admin',
    ),
    MongooseModule.forFeature(schemas),
  ],
  providers: [UserHandler, WalletHandler],
})
export class InfrastructureModule {}
