import axios, { AxiosInstance } from 'axios';
import config from '../config';

interface AccountInfo {
  account_hash: string;
  public_key?: string;
}

export class CSPRCloudAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.csprCloudUrl,
      headers: {
        Authorization: `Bearer ${config.csprCloudAccessKey}`,
      },
    });
  }

  async getAccountInfo(accountHash: string): Promise<AccountInfo | null> {
    try {
      const response = await this.client.get(`/accounts/${accountHash}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch account info for ${accountHash}:`, error);
      return null;
    }
  }

  async withPublicKeys<T extends { userAccountHash: string }>(items: T[]): Promise<T[]> {
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const accountInfo = await this.getAccountInfo(item.userAccountHash);
        return {
          ...item,
          publicKey: accountInfo?.public_key || null,
        };
      })
    );
    return enrichedItems;
  }

  async getContractData(contractHash: string): Promise<any> {
    try {
      const response = await this.client.get(`/contracts/${contractHash}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch contract data for ${contractHash}:`, error);
      return null;
    }
  }
}
