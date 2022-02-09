import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommandBus } from '@nestjs/cqrs';

import { AuthenticationInterface } from '@commands/interfaces/authentication.interface';
import { RefreshInterface } from '@commands/interfaces/refresh.interface';
import { RegistrationCommand } from '@commands/registration.command';
import { AuthenticateCommand } from '@commands/authenticate.command';
import { RefreshCommand } from '@commands/refresh.command';

@Controller('auth')
export class AuthenticationController {
  constructor(private commandBus: CommandBus) {}

  @Post('login')
  async login(@Body() data: AuthenticationInterface) {
    return this.commandBus.execute(new AuthenticateCommand(data));
  }

  @UseGuards(AuthGuard('jwt_refresh'))
  @Post('refresh')
  async refresh(
    @Body() { refresh }: RefreshInterface,
    @Request() { user: { id, user } },
  ) {
    return this.commandBus.execute(new RefreshCommand({ id, user, refresh }));
  }

  @Post('register')
  async register(@Body() data: AuthenticationInterface) {
    return this.commandBus.execute(new RegistrationCommand(data));
  }
}
