import { CreateUserCommand } from '@commands/create-user.command';
import { ListUsersCommand, UserTypes } from '@commands/list-users.command';
import { ProfileCommand } from '@commands/profile.command';
import { UpdateUserCommand } from '@commands/update-user.command';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async refresh(@Request() { user: { user } }) {
    return this.commandBus.execute(new ProfileCommand(user, user));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':kind')
  async list(
    @Param('kind') kind: UserTypes,
    @Query('limit') limit = 10,
    @Query('page') page = 0,
    @Query('sort')
    sort: 'newest' | 'oldest' | 'balanceAsc' | 'balanceDesc' = 'newest',
    @Query('filters') filters: string,
    @Request() { user: { user } },
  ) {
    console.log('filters', JSON.parse(filters).active);
    return this.commandBus.execute(
      new ListUsersCommand(kind, user, page, limit, sort, JSON.parse(filters)),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':kind/:id')
  async read(
    @Param('kind') _kind: UserTypes,
    @Param('id') id: string,
    @Request() { user: { user } },
  ) {
    return this.commandBus.execute(new ProfileCommand(id, user));
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':kind/:id')
  async update(
    @Param('kind') _kind: UserTypes,
    @Param('id') id: string,
    @Request() { user: { user } },
    @Body() data: any,
  ) {
    return this.commandBus.execute(new UpdateUserCommand(id, user, data));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':kind')
  async create(
    @Param('kind') _kind: UserTypes,
    @Request() { user: { user } },
    @Body() data: any,
  ) {
    console.log('data', data);
    return this.commandBus.execute(new CreateUserCommand(user, data));
  }
}
