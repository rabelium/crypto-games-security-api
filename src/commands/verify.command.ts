import { VerifyInterface } from './interfaces/verify.interface';

export class VerifyCommand {
  constructor(
    public readonly data: VerifyInterface,
    public readonly ignoreExpiration = false,
  ) {}
}
