export type UserTypes = 'admins' | 'managers' | 'shops' | 'players';

export class ListUsersCommand {
  constructor(
    public readonly kind: UserTypes,
    public readonly handler: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly orderby?:
      | 'newest'
      | 'oldest'
      | 'balanceAsc'
      | 'balanceDesc',
    public readonly filters?: any,
  ) {}
}
