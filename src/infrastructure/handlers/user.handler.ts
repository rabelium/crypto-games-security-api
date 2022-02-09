import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserInterface } from '@commands/interfaces/user.interface';
import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';
import { WalletCommand } from '@commands/wallet.command';
import {
  User,
  UserDocument,
} from '@infrastructure/database/schemas/user.schema';

@CommandHandler(UserCommand)
export class UserHandler implements ICommandHandler<UserCommand> {
  constructor(
    private commandBus: CommandBus,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  execute(command: UserCommand): Promise<Readonly<UserResponse>> {
    return this[command.operation](
      command.handler,
      command.query,
      command.data,
    );
  }

  orders = {
    oldest: () => ['created_at', 1],
    newest: () => ['created_at', -1],
    balanceAsc: (handler: string) => [`balance.${handler}`, 1],
    balanceDesc: (handler: string) => [`balance.${handler}`, -1],
    debtAsc: (handler: string) => [`debt.${handler}`, 1],
    debtDesc: (handler: string) => [`debt.${handler}`, -1],
  };

  private async list(
    handler: string,
    query: Partial<UserInterface>,
  ): Promise<{ result: Readonly<UserResponse>[]; count: number }> {
    const { role, limit, page, orderby, filters } = query;
    console.log('filters', filters);
    console.log('filters', { roles: role, handlers: handler });

    return {
      result: await this.userModel
        .find({
          roles: role,
          handlers: handler,
          ...this.processFilters(filters, handler),
        })
        .sort([this.orders[orderby](handler)])
        .skip(parseInt(`${page}`) * parseInt(`${limit}`))
        .limit(parseInt(`${limit}`))
        .then((documents) =>
          (documents || []).map((document) =>
            UserResponse.build(document, handler),
          ),
        ),
      count: await this.userModel.countDocuments({
        roles: role,
        handlers: handler,
      }),
    };
  }

  private processFilters(filters: any, handler: string) {
    const query = {};
    for (const key of Object.keys(filters)) {
      if (filters[key] !== null && filters[key] !== undefined) {
        switch (key) {
          case 'enabled':
          case 'reset':
            query[`${key}`] = Boolean(parseInt(filters[key]));
            break;
          case 'balance':
            switch (filters[key]) {
              case 'green':
                query[`balance.${handler}`] = { $gt: 1000 };
                break;
              case 'orange':
                query[`balance.${handler}`] = { $gt: 0, $lte: 1000 };
                break;
              case 'red':
                query[`balance.${handler}`] = { $lte: 0 };
                break;
            }
            break;
          case 'debt':
            switch (filters[key]) {
              case 'red':
                query[`debt.${handler}`] = { $gt: 1000 };
                break;
              case 'orange':
                query[`debt.${handler}`] = { $gt: 0, $lte: 1000 };
                break;
              case 'green':
                query[`debt.${handler}`] = { $lte: 0 };
                break;
            }
            break;
        }
      }
    }

    return query;
  }

  private read(
    handler: string,
    filters: Partial<UserInterface>,
  ): Promise<Readonly<UserResponse>> {
    return this.userModel
      .aggregate(this.getQuery(handler, filters))
      .then(([entity]) => {
        console.log('entity', entity._id);
        console.log('handler', handler);
        if (entity._id === handler) {
          return this.commandBus
            .execute(
              new WalletCommand('detailed', {
                owner_id: entity._id,
              }),
            )
            .then((wallets) => UserResponse.build(entity, handler, wallets));
        }
        console.log('====================');
        return entity ? UserResponse.build(entity, handler) : null;
      });
  }

  private async create(
    handler: string,
    _filters: Partial<UserInterface>,
    data: Partial<UserDocument>,
  ): Promise<Readonly<UserResponse>> {
    return new this.userModel(data).save().then((entity) =>
      this.commandBus
        .execute(
          new WalletCommand(
            'create',
            {},
            {
              owner_id: entity._id,
              handler_id: handler,
            },
          ),
        )
        .then(() => this.read(handler, { _id: entity._id })),
    );
  }

  private async update(
    handler: string,
    _filters: Partial<UserInterface>,
    data: Partial<UserDocument>,
  ): Promise<Readonly<UserResponse>> {
    return this.read(handler, { _id: data._id });
  }

  private disable(
    handler: string,
    query: Partial<UserInterface>,
  ): Promise<Readonly<UserResponse>> {
    return this.userModel
      .findOneAndUpdate(this.getQuery(handler, query), { enabdled: false })
      .then((entity) => (entity ? UserResponse.build(entity) : null));
  }

  private getQuery(
    handlers: string | string[],
    filters: any,
    customFilters: any = {},
  ) {
    const $match: any = { ...filters };
    if ($match.role) {
      $match.roles = $match.role;
      delete $match.role;
    }
    for (const key of Object.keys(customFilters)) {
      if (customFilters[key] !== null && customFilters[key] !== undefined) {
        switch (key) {
          case 'enabled':
          case 'reset':
            $match[`${key}`] = Boolean(parseInt(customFilters[key]));
            break;
        }
      }
    }
    const query: any[] = [{ $match }];
    if (handlers) {
      query.push({
        $lookup: {
          from: 'wallets',
          localField: '_id',
          foreignField: 'owner_id',
          as: 'wallets',
        },
      });
      query.push({
        $addFields: {
          handlers: {
            $map: {
              input: '$wallets',
              as: 'wallet',
              in: '$$wallet.handler_id',
            },
          },
        },
      });
      query.push({
        $match: {
          handlers,
        },
      });
      const postFiltering = {
        $match: {
          handlers,
        },
      };
      for (const key of Object.keys(customFilters)) {
        if (customFilters[key] !== null && customFilters[key] !== undefined) {
          switch (key) {
            case 'balance':
              switch (customFilters[key]) {
                case 'green':
                  postFiltering.$match['wallet.balance'] = { $gt: 1000 };
                  break;
                case 'orange':
                  postFiltering.$match['wallet.balance'] = {
                    $and: [{ $gt: 0 }, { $lte: 1000 }],
                  };
                  break;
                case 'red':
                  postFiltering.$match['balance'] = { $lte: 0 };
                  break;
              }
              break;
          }
        }
      }
    }
    return query;
  }
}
