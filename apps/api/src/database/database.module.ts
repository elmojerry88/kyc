import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KycSubmission } from './entities/kyc-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [KycSubmission],
        synchronize: false, // In MVP we created the table manually via init.sql
      }),
    }),
    TypeOrmModule.forFeature([KycSubmission]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
