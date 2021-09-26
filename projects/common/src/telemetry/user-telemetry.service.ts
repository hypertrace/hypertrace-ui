import { UserTraits } from './telemetry';

export abstract class UserTelemetryService {
  public abstract initialize(): void;
  public abstract identify(userTraits: UserTraits): void;
  public abstract shutdown(): void;
}
