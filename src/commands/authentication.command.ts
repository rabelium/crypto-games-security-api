import { AuthenticationInterface } from '@commands/interfaces/authentication.interface';

import { RefreshInterface } from './interfaces/refresh.interface';
import { VerifyInterface } from './interfaces/verify.interface';

type AuthenticationOperationType = 'authenticate' | 'verify' | 'refresh';

export class AuthenticationCommand {
  constructor(
    public readonly operation: AuthenticationOperationType,
    public readonly data: AuthenticationInterface | RefreshInterface | VerifyInterface,
  ) {}
}
