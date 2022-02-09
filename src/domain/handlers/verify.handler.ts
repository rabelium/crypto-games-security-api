import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { VerifyCommand } from '@commands/verify.command';

@CommandHandler(VerifyCommand)
export class VerifyHandler implements ICommandHandler<VerifyCommand> {
  constructor(private readonly jwt: JwtService) {}

  async execute(command: VerifyCommand): Promise<any> {
    const { token } = command.data;
    const {
      payload: { user, keyid: id },
    } = this.jwt.verify(token, { ignoreExpiration: command.ignoreExpiration });
    return { user, id };
  }
}
