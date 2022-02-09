import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthenticationResponse } from '@valueObjects/authentication.response';
import { RefreshCommand } from '@commands/refresh.command';
import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    private commandBus: CommandBus,
    private readonly jwt: JwtService,
  ) {}

  async execute(
    command: RefreshCommand,
  ): Promise<Readonly<AuthenticationResponse>> {
    const { id, user, refresh } = command.data;
    const { header, payload } = this.jwt.verify(refresh);

    if (header.kid === id && payload.user === user) {
      const entity: UserResponse = await this.commandBus.execute(
        new UserCommand('read', user, { _id: user }),
      );

      if (!entity) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!entity.enabled) {
        throw new HttpException('User disabled', HttpStatus.NOT_ACCEPTABLE);
      }

      return AuthenticationResponse.build(entity, this.jwt).serialize();
    }
    throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
  }
}
