import { Roles, UserEntity } from '@infrastructure/database';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';
import { WalletResponse } from './wallet.response';

@Serialize({})
export class UserResponse extends Serializable {
  private constructor(private readonly entity: UserEntity | any) {
    super();
  }

  static build(entity: UserEntity | any): Readonly<UserResponse> {
    return Object.freeze(new UserResponse(entity));
  }

  @SerializeProperty()
  public get id(): string {
    return this.entity?.id.toString();
  }

  @SerializeProperty()
  public get display_name(): string {
    return this.entity?.display_name.toString();
  }

  @SerializeProperty()
  public get username(): string {
    return this.entity?.username.toString();
  }

  @SerializeProperty()
  public get reset(): boolean {
    return Boolean(this.entity?.reset);
  }

  @SerializeProperty()
  public get enabled(): boolean {
    return Boolean(this.entity?.enabled);
  }

  @SerializeProperty()
  public get balance(): number {
    return this.entity?.balance || 0;
  }

  @SerializeProperty()
  public get wallet(): any {
    return WalletResponse.build(
      this.entity?.wallets?.find(Boolean),
    ).serialize();
  }

  @SerializeProperty()
  public get created_at(): string {
    return this.entity?.created_at?.toISOString();
  }

  @SerializeProperty()
  public get updated_at(): string {
    return this.entity?.updated_at?.toISOString();
  }

  @SerializeProperty()
  public get roles(): Roles[] {
    return this.entity.roles;
  }

  public validate(plainPassword: string): boolean {
    return this.entity.check(plainPassword);
  }
}
