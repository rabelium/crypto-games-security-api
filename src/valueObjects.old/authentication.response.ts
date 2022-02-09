import { JwtService } from '@nestjs/jwt';
import { Serialize, SerializeProperty, Serializable } from 'ts-serializer';

import { UserResponse } from './user.response';

const { randomUUID } = require('crypto');

@Serialize({})
export class AuthenticationResponse extends Serializable {
  private constructor(
    private readonly entity: UserResponse,
    private readonly jwt: JwtService,
  ) {
    super();
  }

  static build(
    entity: UserResponse,
    jwt: JwtService,
  ): Readonly<AuthenticationResponse> {
    return Object.freeze(new AuthenticationResponse(entity, jwt));
  }

  private keyid = randomUUID();
  private signature = this.jwt.sign({ user: this.entity.id, keyid: this.keyid });
  private verification = this.jwt.verify(this.signature);

  @SerializeProperty()
  public get token(): string {
    return this.signature;
  }

  @SerializeProperty()
  public get refresh(): string {
    return this.jwt.sign({ user: this.entity.id }, { expiresIn: '1y', keyid: this.keyid });
  }

  @SerializeProperty()
  public get expiresIn(): string {
    return new Date(this.verification?.payload?.exp * 1000).toISOString();
  }

  @SerializeProperty()
  public get enabled(): boolean {
    return this.entity.enabled;
  }

  @SerializeProperty()
  public get reset(): boolean {
    return this.entity.reset;
  }
}
