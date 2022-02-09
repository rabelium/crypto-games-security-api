import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';

import { AuthenticationResponse } from '@valueObjects/authentication.response';
import { ProfileCommand } from '@commands/profile.command';
import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';

@CommandHandler(ProfileCommand)
export class ProfileHandler implements ICommandHandler<ProfileCommand> {
  constructor(private commandBus: CommandBus) {}

  async execute(
    command: ProfileCommand,
  ): Promise<Readonly<AuthenticationResponse>> {
    const { id: _id, handler } = command;
    console.log('id', _id);
    const entity: UserResponse = await this.commandBus.execute(
      new UserCommand('read', handler, { _id }),
    );

    if (!entity) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    if (!entity.enabled) {
      throw new HttpException('User disabled', HttpStatus.NOT_ACCEPTABLE);
    }

    return entity.serialize();
  }
}
