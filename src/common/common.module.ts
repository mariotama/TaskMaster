import { Module } from '@nestjs/common';
import { ProgressionService } from './progression/progression.service';
import { NotificationService } from './notification/notification.service';

@Module({
  providers: [ProgressionService, NotificationService]
})
export class CommonModule {}
