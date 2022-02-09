import { AuthenticationInterface } from './interfaces/authentication.interface';

export class RegistrationCommand {
  constructor(public readonly data: AuthenticationInterface) {
    Object.assign(this, data);
  }

  username: string;
  password: string;
}
