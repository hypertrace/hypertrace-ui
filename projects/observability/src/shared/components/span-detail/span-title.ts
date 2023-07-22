export class SpanTitle {
  public constructor(public serviceName?: string, public protocolName?: string, public apiName?: string) {}

  public toString(): string {
    return `${this.serviceName} ${this.protocolName ?? ''} ${this.apiName ?? ''}`.trim();
  }
}
