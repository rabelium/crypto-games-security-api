import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WalletCommand } from '@commands/wallet.command';
import { WalletResponse } from '@valueObjects/wallet.response';
import {
  Wallet,
  WalletDocument,
} from '@infrastructure/database/schemas/wallet.schema';
import {
  Block,
  BlockDocument,
} from '@infrastructure/database/schemas/block.schema';

@CommandHandler(WalletCommand)
export class WalletHandler implements ICommandHandler<WalletCommand> {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
  ) {}

  execute(command: WalletCommand): Promise<any> {
    return this[command.operation](command.query, command.data);
  }

  private async create(
    _filters: any,
    data: any,
  ): Promise<Readonly<WalletResponse>> {
    return new this.walletModel(data)
      .save()
      .then((entity) => (entity ? WalletResponse.build(entity) : null));
  }

  private async detailed(query: any): Promise<Readonly<WalletResponse>[]> {
    console.log('detailed', query);
    return this.walletModel
      .find(query)
      .then((entities) => {
        console.log('entities', entities);
        return entities;
      })
      .then((entities) =>
        Promise.all(
          entities.map(async (entity) =>
            WalletResponse.build(entity, await this.getWalletStats(entity._id)),
          ),
        ),
      );
  }

  private getWalletStats(id: string) {
    const today = new Date();
    return this.blockModel
      .aggregate([
        {
          $set: {
            diff: {
              $dateDiff: {
                startDate: {
                  $toDate: '$created_on',
                },
                endDate: '$$NOW',
                unit: 'day',
              },
            },
          },
        },
        {
          $match: {
            $or: [
              {
                'data.sender_id': id,
              },
              {
                'data.receiver_id': id,
              },
            ],
            diff: {
              $lte: 30,
            },
          },
        },
        {
          $bucket: {
            groupBy: '$diff',
            boundaries: [...Array(30).keys()].map((i) => i + 1),
            output: {
              balance: {
                $sum: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: ['$data.receiver_id', id],
                        },
                        then: '$data.amount',
                      },
                      {
                        case: {
                          $eq: ['$data.sender_id', id],
                        },
                        then: {
                          $multiply: [-1, '$data.amount'],
                        },
                      },
                    ],
                    default: 0,
                  },
                },
              },
            },
          },
        },
      ])
      .then((stats) => {
        console.log('sttt', stats);
        return stats;
      })
      .then((stats) =>
        stats.map((stat) => ({
          date: new Date(
            today.setDate(today.getDate() - stat._id),
          ).toISOString(),
          balance: stat.balance,
        })),
      );
  }
}
