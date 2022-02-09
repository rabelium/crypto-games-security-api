import { UserEntity } from '@infrastructure/database';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly handler: string,
    public readonly data?: Partial<UserEntity>,
  ) {}
}
