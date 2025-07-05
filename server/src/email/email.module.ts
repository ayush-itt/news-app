import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import {
  EmailTransporterFactory,
  EMAIL_TRANSPORTER,
} from './email-transporter.factory';
import { AppConfigModule } from '@/config/app-config/app-config.module';
import { AppConfigService } from '@/config/app-config/app-config.service';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: EMAIL_TRANSPORTER,
      useFactory: async (appConfigService: AppConfigService) => {
        return EmailTransporterFactory.createTransporter(appConfigService);
      },
      inject: [AppConfigService],
    },
    EmailService,
  ],
  exports: [EmailService, EMAIL_TRANSPORTER],
})
export class EmailModule {}
