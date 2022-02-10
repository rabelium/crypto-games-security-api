import { UserInterface } from './interfaces/user.interface';

type UserOperationsType =
  | 'list'
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'disable';

export class UserCommand {
  constructor(
    public readonly operation: UserOperationsType,
    public readonly handler: string,
    public readonly query: Partial<UserInterface>,
    public readonly data?: any,
  ) {}
}
