#![no_std]

use odra::prelude::*;
use odra::casper_types::U512;

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
}

#[odra::module(events = [Staked, Unstaked])]
pub struct StakeVue {
    stakes: Mapping<Address, U512>,
    total_staked: Var<U512>,
}

#[odra::event]
pub struct Staked {
    pub staker: Address,
    pub amount: U512,
}

#[odra::event]
pub struct Unstaked {
    pub staker: Address,
    pub amount: U512,
}

#[odra::module]
impl StakeVue {
    pub fn init(&mut self) {
        self.total_staked.set(U512::zero());
    }

    #[odra(payable)]
    pub fn stake(&mut self) {
        let staker = self.env().caller();
        let amount = self.env().attached_value();
        
        let current = self.stakes.get(&staker).unwrap_or(U512::zero());
        self.stakes.set(&staker, current + amount);
        
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total + amount);
        
        self.env().emit_event(Staked { staker, amount });
    }
    
    pub fn unstake(&mut self, amount: U512) {
        let staker = self.env().caller();
        let current = self.stakes.get(&staker).unwrap_or(U512::zero());
        
        if amount > current {
            self.env().revert(Error::InsufficientBalance);
        }
        
        self.stakes.set(&staker, current - amount);
        
        let total = self.total_staked.get_or_default();
        self.total_staked.set(total - amount);
        
        self.env().transfer_tokens(&staker, &amount);
        self.env().emit_event(Unstaked { staker, amount });
    }
    
    pub fn get_stake(&self, staker: Address) -> U512 {
        self.stakes.get(&staker).unwrap_or(U512::zero())
    }
    
    pub fn get_total_staked(&self) -> U512 {
        self.total_staked.get_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef, NoArgs};

    fn setup() -> (odra::host::HostEnv, StakeVueHostRef) {
        let env = odra_test::env();
        let contract = StakeVue::deploy(&env, NoArgs);
        (env, contract)
    }

    #[test]
    fn test_initial_state() {
        // Given: Un nouveau contrat déployé
        let (env, contract) = setup();
        let user = env.get_account(0);

        // Then: Le total staké est 0
        assert_eq!(contract.get_total_staked(), U512::zero());

        // And: Le stake de l'utilisateur est 0
        assert_eq!(contract.get_stake(user), U512::zero());
    }

    #[test]
    fn test_stake_works() {
        // Given: Un contrat et un utilisateur avec des CSPR
        let (env, contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64); // 100 CSPR

        // When: L'utilisateur stake 100 CSPR
        contract.with_tokens(stake_amount).stake();

        // Then: Le stake de l'utilisateur est mis à jour
        assert_eq!(contract.get_stake(staker), stake_amount);

        // And: Le total staké est mis à jour
        assert_eq!(contract.get_total_staked(), stake_amount);

        // And: L'événement Staked est émis
        assert!(env.emitted_event(
            &contract,
            Staked {
                staker,
                amount: stake_amount
            }
        ));
    }

    #[test]
    fn test_multiple_stakes() {
        // Given: Un contrat
        let (env, contract) = setup();
        let staker = env.get_account(0);
        let first_stake = U512::from(50_000_000_000u64);  // 50 CSPR
        let second_stake = U512::from(30_000_000_000u64); // 30 CSPR

        // When: L'utilisateur stake deux fois
        contract.with_tokens(first_stake).stake();
        contract.with_tokens(second_stake).stake();

        // Then: Les stakes sont cumulés
        assert_eq!(contract.get_stake(staker), first_stake + second_stake);
        assert_eq!(contract.get_total_staked(), first_stake + second_stake);
    }

    #[test]
    fn test_multiple_users_stake() {
        // Given: Un contrat et deux utilisateurs
        let (env, contract) = setup();
        let user1 = env.get_account(0);
        let user2 = env.get_account(1);
        let amount1 = U512::from(100_000_000_000u64); // 100 CSPR
        let amount2 = U512::from(50_000_000_000u64);  // 50 CSPR

        // When: User1 stake
        env.set_caller(user1);
        contract.with_tokens(amount1).stake();

        // And: User2 stake
        env.set_caller(user2);
        contract.with_tokens(amount2).stake();

        // Then: Chaque utilisateur a son propre stake
        assert_eq!(contract.get_stake(user1), amount1);
        assert_eq!(contract.get_stake(user2), amount2);

        // And: Le total est la somme des deux
        assert_eq!(contract.get_total_staked(), amount1 + amount2);
    }

    #[test]
    fn test_unstake_works() {
        // Given: Un utilisateur a staké 100 CSPR
        let (env, mut contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64);
        let unstake_amount = U512::from(40_000_000_000u64); // 40 CSPR

        contract.with_tokens(stake_amount).stake();

        // When: L'utilisateur unstake 40 CSPR
        contract.unstake(unstake_amount);

        // Then: Le stake est réduit
        assert_eq!(contract.get_stake(staker), stake_amount - unstake_amount);

        // And: Le total est réduit
        assert_eq!(contract.get_total_staked(), stake_amount - unstake_amount);

        // And: L'événement Unstaked est émis
        assert!(env.emitted_event(
            &contract,
            Unstaked {
                staker,
                amount: unstake_amount
            }
        ));
    }

    #[test]
    fn test_unstake_full_amount() {
        // Given: Un utilisateur a staké 100 CSPR
        let (env, mut contract) = setup();
        let staker = env.get_account(0);
        let stake_amount = U512::from(100_000_000_000u64);

        contract.with_tokens(stake_amount).stake();

        // When: L'utilisateur unstake tout
        contract.unstake(stake_amount);

        // Then: Le stake est à zéro
        assert_eq!(contract.get_stake(staker), U512::zero());
        assert_eq!(contract.get_total_staked(), U512::zero());
    }

    #[test]
    fn test_unstake_insufficient_balance_fails() {
        // Given: Un utilisateur a staké 50 CSPR
        let (_env, mut contract) = setup();
        let stake_amount = U512::from(50_000_000_000u64);
        let unstake_amount = U512::from(100_000_000_000u64); // Plus que le stake

        contract.with_tokens(stake_amount).stake();

        // When: L'utilisateur essaie d'unstake plus que son stake
        // Then: Une erreur InsufficientBalance est retournée
        assert_eq!(
            contract.try_unstake(unstake_amount),
            Err(Error::InsufficientBalance.into())
        );
    }

    #[test]
    fn test_unstake_without_stake_fails() {
        // Given: Un utilisateur sans stake
        let (_env, mut contract) = setup();
        let unstake_amount = U512::from(10_000_000_000u64);

        // When: L'utilisateur essaie d'unstake
        // Then: Une erreur InsufficientBalance est retournée
        assert_eq!(
            contract.try_unstake(unstake_amount),
            Err(Error::InsufficientBalance.into())
        );
    }

    #[test]
    fn test_user_cannot_unstake_others_stake() {
        // Given: User1 a staké 100 CSPR
        let (env, mut contract) = setup();
        let user1 = env.get_account(0);
        let user2 = env.get_account(1);
        let stake_amount = U512::from(100_000_000_000u64);

        env.set_caller(user1);
        contract.with_tokens(stake_amount).stake();

        // When: User2 essaie d'unstake
        env.set_caller(user2);

        // Then: Échec car User2 n'a pas de stake
        assert_eq!(
            contract.try_unstake(stake_amount),
            Err(Error::InsufficientBalance.into())
        );

        // And: Le stake de User1 est intact
        assert_eq!(contract.get_stake(user1), stake_amount);
    }
}
