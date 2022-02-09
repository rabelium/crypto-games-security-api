import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthenticationResponse } from '@valueObjects/authentication.response';
import { CreateUserCommand } from '@commands/create-user.command';
import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private commandBus: CommandBus) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<Readonly<AuthenticationResponse>> {
    const { handler, data } = command;
    const entity: UserResponse = await this.commandBus.execute(
      new UserCommand('create', handler, {}, data),
    );

    return entity.serialize();
  }
}
