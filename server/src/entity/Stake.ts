import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('stakes')
export class Stake {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  userAccountHash!: string;

  @Column({ type: 'enum', enum: ['stake', 'unstake', 'transfer'] })
  @Index()
  actionType!: 'stake' | 'unstake' | 'transfer';

  @Column({ type: 'varchar', length: 255 })
  amount!: string; // CSPR amount in motes (U512 as string)

  @Column({ type: 'varchar', length: 255, nullable: true })
  stCsprAmount!: string | null; // stCSPR amount in motes

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipientAccountHash!: string | null; // For transfer actions

  @Column({ type: 'varchar', length: 255 })
  @Index()
  txHash!: string;

  @Column({ type: 'bigint' })
  blockHeight!: number;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
