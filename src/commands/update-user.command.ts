export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly handler: string,
    public readonly data?: any,
  ) {}
}
