import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  public getPort(): number {
    return Number(this.getValue('SERVER_PORT'));
  }

  private getValue(key: string, throwOnMissing = true): string | undefined {
    if (throwOnMissing) {
      return this.configService.getOrThrow(key);
    }
    return this.configService.get(key);
  }
}
