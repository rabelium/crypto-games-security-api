import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';
import { RegistrationCommand } from '@commands/registration.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Roles } from '@infrastructure/database';

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand>
{
  constructor(private commandBus: CommandBus) {}

  async execute(command: RegistrationCommand): Promise<UserResponse> {
    const user: UserResponse = await this.commandBus.execute(
      new UserCommand('read', null, { username: command.username }),
    );

    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    await this.commandBus.execute(
      new UserCommand('create', null, {
        username: command.username,
        password: command.password,
        role: Roles.User,
      }),
    );

    return this.commandBus
      .execute(
        new UserCommand('read', null, {}, { username: command.username }),
      )
      .then((user) => user.serialize());
  }
}
