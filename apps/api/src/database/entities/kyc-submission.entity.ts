import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { KycStatus } from '@kyc/shared';

@Entity('kyc_submissions')
export class KycSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'date' })
  data_nascimento: Date;

  @Column({ type: 'varchar', length: 20 })
  nif: string;

  @Column({ type: 'varchar', length: 500 })
  bi_frente_key: string;

  @Column({ type: 'varchar', length: 500 })
  bi_verso_key: string;

  @Column({ type: 'varchar', length: 500 })
  selfie_key: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: KycStatus;

  @Column({ type: 'jsonb', nullable: true })
  agent_result: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
