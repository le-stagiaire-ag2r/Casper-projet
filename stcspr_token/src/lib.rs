#![no_std]

use odra::prelude::*;
use odra::casper_types::U256;

#[odra::event]
pub struct Transfer {
    pub from: Option<Address>,
    pub to: Option<Address>,
    pub amount: U256,
}

#[odra::event]
pub struct Approval {
    pub owner: Address,
    pub spender: Address,
    pub amount: U256,
}

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientAllowance = 2,
    NotOwner = 3,
}

#[odra::module(events = [Transfer, Approval], errors = Error)]
pub struct StCsprToken {
    name: Var<String>,
    symbol: Var<String>,
    decimals: Var<u8>,
    total_supply: Var<U256>,
    balances: Mapping<Address, U256>,
    allowances: Mapping<(Address, Address), U256>,
    owner: Var<Address>,
}

#[odra::module]
impl StCsprToken {
    pub fn init(&mut self, name: String, symbol: String, decimals: u8) {
        self.name.set(name);
        self.symbol.set(symbol);
        self.decimals.set(decimals);
        self.total_supply.set(U256::zero());
        self.owner.set(self.env().caller());
    }

    pub fn name(&self) -> String {
        self.name.get_or_default()
    }

    pub fn symbol(&self) -> String {
        self.symbol.get_or_default()
    }

    pub fn decimals(&self) -> u8 {
        self.decimals.get_or_default()
    }

    pub fn total_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }

    pub fn balance_of(&self, address: Address) -> U256 {
        self.balances.get(&address).unwrap_or_default()
    }

    pub fn allowance(&self, owner: Address, spender: Address) -> U256 {
        self.allowances.get(&(owner, spender)).unwrap_or_default()
    }

    pub fn transfer(&mut self, recipient: Address, amount: U256) {
        let sender = self.env().caller();
        self.raw_transfer(sender, recipient, amount);
    }

    pub fn approve(&mut self, spender: Address, amount: U256) {
        let owner = self.env().caller();
        self.allowances.set(&(owner, spender), amount);
        self.env().emit_event(Approval { owner, spender, amount });
    }

    pub fn transfer_from(&mut self, owner: Address, recipient: Address, amount: U256) {
        let spender = self.env().caller();
        let current_allowance = self.allowances.get(&(owner, spender)).unwrap_or_default();
        if current_allowance < amount {
            self.env().revert(Error::InsufficientAllowance);
        }
        self.allowances.set(&(owner, spender), current_allowance - amount);
        self.raw_transfer(owner, recipient, amount);
    }

    pub fn mint(&mut self, to: Address, amount: U256) {
        // Note: No owner check for hackathon - allows StakeVue cross-contract calls
        let balance = self.balances.get(&to).unwrap_or_default();
        self.balances.set(&to, balance + amount);
        let total = self.total_supply.get_or_default();
        self.total_supply.set(total + amount);
        self.env().emit_event(Transfer { from: None, to: Some(to), amount });
    }

    pub fn burn(&mut self, from: Address, amount: U256) {
        // Note: No owner check for hackathon - allows StakeVue cross-contract calls
        let balance = self.balances.get(&from).unwrap_or_default();
        if balance < amount {
            self.env().revert(Error::InsufficientBalance);
        }
        self.balances.set(&from, balance - amount);
        let total = self.total_supply.get_or_default();
        self.total_supply.set(total - amount);
        self.env().emit_event(Transfer { from: Some(from), to: None, amount });
    }

    pub fn get_owner(&self) -> Address {
        self.owner.get_or_revert_with(Error::NotOwner)
    }

    pub fn transfer_ownership(&mut self, new_owner: Address) {
        self.assert_owner();
        self.owner.set(new_owner);
    }

    fn raw_transfer(&mut self, from: Address, to: Address, amount: U256) {
        let from_balance = self.balances.get(&from).unwrap_or_default();
        if from_balance < amount {
            self.env().revert(Error::InsufficientBalance);
        }
        self.balances.set(&from, from_balance - amount);
        let to_balance = self.balances.get(&to).unwrap_or_default();
        self.balances.set(&to, to_balance + amount);
        self.env().emit_event(Transfer { from: Some(from), to: Some(to), amount });
    }

    fn assert_owner(&self) {
        let caller = self.env().caller();
        let owner = self.owner.get_or_revert_with(Error::NotOwner);
        if caller != owner {
            self.env().revert(Error::NotOwner);
        }
    }
}
