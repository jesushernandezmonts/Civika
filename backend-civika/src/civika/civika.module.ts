import { Module } from '@nestjs/common';
import { CivikaController } from './civika.controller';
import { CivikaService } from './civika.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, MailModule, ConfigModule],
  controllers: [CivikaController],
  providers: [CivikaService],
  exports: [CivikaService],
})
export class CivikaModule {}
