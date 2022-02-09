import { Strategy } from 'passport-http-header-strategy';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { VerifyCommand } from '@commands/verify.command';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private commandBus: CommandBus) {
    super({ header: 'Authorization' });
  }

  async validate(token: any) {
    return this.commandBus.execute(new VerifyCommand({ token }));
  }
}
