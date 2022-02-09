import { UserEntity } from '@infrastructure/database';

export class CreateUserCommand {
  constructor(
    public readonly handler: string,
    public readonly data?: Partial<UserEntity>,
  ) {}
}
