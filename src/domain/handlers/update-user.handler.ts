import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthenticationResponse } from '@valueObjects/authentication.response';
import { UpdateUserCommand } from '@commands/update-user.command';
import { UserResponse } from '@valueObjects/user.response';
import { UserCommand } from '@commands/user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private commandBus: CommandBus) {}

  async execute(
    command: UpdateUserCommand,
  ): Promise<Readonly<AuthenticationResponse>> {
    const { id: _id, handler, data } = command;
    const entity: UserResponse = await this.commandBus.execute(
      new UserCommand('update', handler, { _id }, data),
    );

    return entity.serialize();
  }
}
