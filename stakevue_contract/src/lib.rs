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
