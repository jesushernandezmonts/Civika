import { Module } from '@nestjs/common';
import { CivikaController } from './civika.controller';
import { CivikaService } from './civika.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CivikaController],
  providers: [CivikaService],
  exports: [CivikaService],
})
export class CivikaModule {}
