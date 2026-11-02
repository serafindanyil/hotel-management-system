export abstract class DatabasePing {
  abstract isReachable(): Promise<boolean>;
}
