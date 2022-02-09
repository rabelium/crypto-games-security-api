import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ListUsersCommand, UserTypes } from '@commands/list-users.command';
import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';
import { Roles } from '@infrastructure/database';

@CommandHandler(ListUsersCommand)
export class ListUsersHandler implements ICommandHandler<ListUsersCommand> {
  constructor(private commandBus: CommandBus) {}

  private rolesForKinds = {
    admins: Roles.Admin,
    managers: Roles.Manager,
    shops: Roles.Shop,
    players: Roles.Player,
  };

  async execute(command: ListUsersCommand): Promise<any> {
    const { kind, handler, page, limit, orderby, filters } = command;

    const response: { result: Readonly<UserResponse>[]; count: number } =
      await this.commandBus.execute(
        new UserCommand('list', handler, {
          orderby,
          filters,
          role: this.getRolesForKind(kind),
          limit,
          page,
        }),
      );

    return {
      result: response.result.map((entity) => entity.serialize()),
      count: response.count,
    };
  }

  private getRolesForKind(kind: UserTypes): Roles {
    return this.rolesForKinds[kind];
  }
}
