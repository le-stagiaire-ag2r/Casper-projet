import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Stake } from '../entity/Stake';

export class StakeRepository {
  private repository: Repository<Stake>;

  constructor() {
    this.repository = AppDataSource.getRepository(Stake);
  }

  async save(stake: Partial<Stake>): Promise<Stake> {
    return this.repository.save(stake);
  }

  async findByUserAccount(userAccountHash: string, limit = 10, offset = 0): Promise<Stake[]> {
    return this.repository.find({
      where: { userAccountHash },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByTxHash(txHash: string): Promise<Stake | null> {
    return this.repository.findOne({ where: { txHash } });
  }

  async findRecent(limit = 10, offset = 0): Promise<Stake[]> {
    return this.repository.find({
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getTotalStaked(): Promise<string> {
    const result = await this.repository
      .createQueryBuilder('stake')
      .select('SUM(CASE WHEN actionType = "stake" THEN CAST(amount AS UNSIGNED) ELSE -CAST(amount AS UNSIGNED) END)', 'total')
      .getRawOne();

    return result?.total?.toString() || '0';
  }

  async getUserTotalStaked(userAccountHash: string): Promise<string> {
    const result = await this.repository
      .createQueryBuilder('stake')
      .select('SUM(CASE WHEN actionType = "stake" THEN CAST(amount AS UNSIGNED) ELSE -CAST(amount AS UNSIGNED) END)', 'total')
      .where('userAccountHash = :userAccountHash', { userAccountHash })
      .getRawOne();

    return result?.total?.toString() || '0';
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countByUser(userAccountHash: string): Promise<number> {
    return this.repository.count({ where: { userAccountHash } });
  }
}
