import { RefreshInterface } from './interfaces/refresh.interface';

export class RefreshCommand {
  constructor(public readonly data: RefreshInterface) {}
}
