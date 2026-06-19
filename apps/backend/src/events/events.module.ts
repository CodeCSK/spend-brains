import { Module } from '@nestjs/common';
import { ParseEventRefPipe } from '../common/pipes/parse-event-ref.pipe';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, ParseEventRefPipe],
})
export class EventsModule {}
