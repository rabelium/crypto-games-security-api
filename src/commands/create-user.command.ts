export class CreateUserCommand {
  constructor(public readonly handler: string, public readonly data?: any) {}
}
