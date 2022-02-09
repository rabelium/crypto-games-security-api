import { WalletEntity } from '@infrastructure/database';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';

@Serialize({})
export class WalletResponse extends Serializable {
    private constructor(private readonly entity: WalletEntity | any) {
        super();
    }

    static build(entity: WalletEntity | any): Readonly<WalletResponse> {
        return Object.freeze(new WalletResponse(entity));
    }

    @SerializeProperty()
    public get id(): string {
        return this.entity?.id.toString();
    }

    @SerializeProperty()
    public get balance(): number {
        return parseFloat(this.entity?.balance);
    }

    @SerializeProperty()
    public get created_at(): string {
        return this.entity?.created_at?.toISOString();
    }
}