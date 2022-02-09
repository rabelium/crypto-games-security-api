import { AuthenticationInterface } from '@commands/interfaces/authentication.interface';

export class AuthenticateCommand {
  constructor(public readonly data: AuthenticationInterface) {}
}
