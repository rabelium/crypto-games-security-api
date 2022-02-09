import { Roles } from '@infrastructure/database';

export interface UserInterface {
  _id: any;
  username: string;
  password: string;
  handler: string;
  role: Roles;
  enabled: boolean;
  orderby: 'newest' | 'oldest' | 'balanceAsc' | 'balanceDesc';
  filters: any;
  reset: boolean;
  limit: number;
  page: number;
}
