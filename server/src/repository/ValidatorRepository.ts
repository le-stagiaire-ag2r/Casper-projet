import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Validator } from '../entity/Validator';

export class ValidatorRepository {
  private repository: Repository<Validator>;

  constructor() {
    this.repository = AppDataSource.getRepository(Validator);
  }

  async save(validator: Partial<Validator>): Promise<Validator> {
    return this.repository.save(validator);
  }

  async findByPublicKey(publicKey: string): Promise<Validator | null> {
    return this.repository.findOne({ where: { publicKey } });
  }

  async findAll(): Promise<Validator[]> {
    return this.repository.find({ order: { createdAt: 'ASC' } });
  }

  async findActive(): Promise<Validator[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async updateStakedAmount(publicKey: string, totalStaked: string): Promise<void> {
    await this.repository.update({ publicKey }, { totalStaked });
  }

  async deactivate(publicKey: string): Promise<void> {
    await this.repository.update({ publicKey }, { isActive: false });
  }

  async activate(publicKey: string): Promise<void> {
    await this.repository.update({ publicKey }, { isActive: true });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countActive(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }
}
