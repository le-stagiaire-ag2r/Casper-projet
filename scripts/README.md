# StakeVue Automation Scripts

Scripts for automating StakeVue contract operations.

## Setup

```bash
cd scripts
npm install
cp .env.example .env
# Edit .env with your private key
```

## Scripts

### add-rewards.js

Adds staking rewards to the contract pool, increasing the exchange rate.

```bash
# Using .env file
npm run add-rewards

# Or with environment variables
PRIVATE_KEY=<your_key> REWARD_AMOUNT=5 npm run add-rewards
```

**Environment Variables:**
- `PRIVATE_KEY` - Owner's private key (hex format) **REQUIRED**
- `REWARD_AMOUNT` - CSPR amount to add (default: 1)
- `RPC_URL` - Casper RPC endpoint
- `CONTRACT_HASH` - Contract package hash

### check-stats.js

Query and display current contract statistics.

```bash
npm run check-stats
```

## Automation

### GitHub Actions (Recommended)

Create `.github/workflows/add-rewards.yml`:

```yaml
name: Add Rewards
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  add-rewards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd scripts && npm install
      - run: cd scripts && npm run add-rewards
        env:
          PRIVATE_KEY: ${{ secrets.OWNER_PRIVATE_KEY }}
          REWARD_AMOUNT: '10'
```

Store `OWNER_PRIVATE_KEY` in GitHub repository secrets.

### Cron Job

```bash
# Run daily at midnight
0 0 * * * cd /path/to/stakevue/scripts && npm run add-rewards >> /var/log/stakevue-rewards.log 2>&1
```

## Security Notes

- Never commit your `.env` file or private keys
- Use environment variables or secrets management in production
- The owner private key has full control over the contract
- Consider using a multi-sig setup for mainnet deployment
