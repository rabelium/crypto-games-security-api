type WalletOperationsType =
  | 'list'
  | 'read'
  | 'create'
  | 'detailed'
  | 'update'
  | 'delete'
  | 'delete'
  | 'disable';

export class WalletCommand {
  constructor(
    public readonly operation: WalletOperationsType,
    public readonly query: any,
    public readonly data?: any,
  ) {}
}
