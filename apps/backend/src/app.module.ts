import { Module } from '@nestjs/common';
import { AppConfigModule } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { MembersModule } from './members/members.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SettlementsModule } from './settlements/settlements.module';
import { FilesModule } from './files/files.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    DashboardModule,
    HealthModule,
    AuthModule,
    UsersModule,
    EventsModule,
    MembersModule,
    CategoriesModule,
    ExpensesModule,
    SettlementsModule,
    FilesModule,
    SmsModule,
  ],
})
export class AppModule {}
