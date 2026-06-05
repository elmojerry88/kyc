import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { KycSubmission } from '../database/entities/kyc-submission.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([KycSubmission]), StorageModule],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
