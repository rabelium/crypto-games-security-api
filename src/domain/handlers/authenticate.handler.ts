import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthenticationResponse } from '@valueObjects/authentication.response';
import { AuthenticateCommand } from '@commands/authenticate.command';
import { UserCommand } from '@commands/user.command';
import { UserResponse } from '@valueObjects/user.response';

@CommandHandler(AuthenticateCommand)
export class AuthenticateHandler
  implements ICommandHandler<AuthenticateCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly jwt: JwtService,
  ) {}

  async execute(
    command: AuthenticateCommand,
  ): Promise<Readonly<AuthenticationResponse>> {
    const { username, password } = command.data;
    const user: UserResponse = await this.commandBus.execute(
      new UserCommand('read', null, { username }),
    );
    if (!user || !user.validate(password)) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    if (!user.enabled) {
      throw new HttpException('User disabled', HttpStatus.NOT_ACCEPTABLE);
    }

    return AuthenticationResponse.build(user, this.jwt).serialize();
  }
}
