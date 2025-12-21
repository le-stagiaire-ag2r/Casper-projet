# StakeVue Release Notes: V18 → V22

> **Période de développement**: Décembre 2025
> **Framework**: Odra 2.4.0 → 2.5.0
> **Réseau**: Casper Testnet 2.0

---

## 📋 Résumé des Versions

| Version | Date | Changement Principal | Statut |
|---------|------|---------------------|--------|
| **V22** | 19 Dec | SDK Compatibility (U512 fix) | ✅ **Actuelle** |
| **V21** | 19 Dec | Odra 2.5.0 Upgrade | ✅ Testé |
| **V20** | 18 Dec | Pool Architecture (Wise Lending) | ✅ Testé |
| **V19** | 17 Dec | Native Odra delegate/undelegate | ❌ Error 64658 |
| **V18** | 16 Dec | Delegation Debug Tools | ❌ Error 64658 |

---

## V22 - SDK Compatibility Fix ✅

**Contract Hash**: `2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3`

### Problème Résolu

L'appel `request_unstake` depuis le frontend web causait l'**Error 19 (LeftOverBytes)**. Le SDK JavaScript encodait les montants en U512 mais le contrat attendait U256.

### Changements

```rust
// AVANT (V21)
pub fn request_unstake(&mut self, stcspr_amount: U256) -> u64

// APRÈS (V22)
pub fn request_unstake(&mut self, stcspr_amount: U512) -> u64
```

### Évènement Modifié

```rust
pub struct UnstakeRequested {
    pub staker: Address,
    pub request_id: u64,
    pub stcspr_amount: U512,  // Changé de U256 à U512
    pub cspr_amount: U512,
}
```

### Résultat

- ✅ Unstake fonctionne depuis le frontend
- ✅ Cycle complet stake → unstake → claim testé et validé
- ✅ 12 tests passent

### Transactions de Test

| Action | Transaction Hash | Montant | Statut |
|--------|-----------------|---------|--------|
| Stake | `43dc3f14...` | 25 CSPR | ✅ Success |
| Unstake | `edc4cd05...` | 20 CSPR | ✅ Success |
| Claim | `75f598bd...` | 5 CSPR | ✅ Success |

---

## V21 - Odra 2.5.0 Upgrade

### Changements

- Upgrade framework Odra 2.4.0 → **2.5.0**
- Meilleur support des validateurs
- Même architecture pool-based que V20
- Corrections de bugs internes Odra

### Dépendances

```toml
[dependencies]
odra = "2.5.0"
odra-modules = "2.5.0"

[dev-dependencies]
odra-test = "2.5.0"
```

### Tests

- ✅ 12/12 tests passent
- ✅ Déploiement testnet réussi
- ❌ Frontend unstake échouait (Error 19) → Corrigé en V22

---

## V20 - Pool Architecture (Wise Lending Style) ✅

### Pourquoi Ce Changement ?

Les versions V17-V19 tentaient de déléguer directement depuis le contrat vers les validateurs, mais Casper 2.0 retournait systématiquement **Error 64658** (purse mismatch).

Après analyse des transactions de **Wise Lending** sur testnet, nous avons adopté leur architecture pool-based.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    POOL ARCHITECTURE V20                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   UTILISATEUR                    ADMIN                      │
│   ───────────                    ─────                      │
│   stake() ────────────┐   ┌───── admin_delegate()           │
│                       │   │                                 │
│   request_unstake() ──┼───┼───── admin_undelegate()         │
│                       │   │                                 │
│   claim() ────────────┼───┼───── admin_add_liquidity()      │
│                       ▼   ▼                                 │
│                 ┌───────────────┐                           │
│                 │     POOL      │                           │
│                 │   (CSPR)      │                           │
│                 └───────┬───────┘                           │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │    VALIDATORS       │                        │
│              │  (délégation admin) │                        │
│              └─────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Entry Points Utilisateur

| Fonction | Description |
|----------|-------------|
| `stake(validator)` | CSPR → pool, mint stCSPR |
| `request_unstake(amount)` | Burn stCSPR, crée demande |
| `claim(request_id)` | Récupère CSPR (si prêt) |

### Entry Points Admin

| Fonction | Description |
|----------|-------------|
| `admin_delegate(validator, amount)` | Délègue du pool vers validateur |
| `admin_undelegate(validator, amount)` | Undélègue d'un validateur |
| `admin_add_liquidity()` | Retourne CSPR undélégué au pool |
| `harvest_rewards(amount)` | Ajoute rewards, update taux |

### Résultat

- ✅ Plus d'erreur 64658
- ✅ Cycle complet fonctionne
- ✅ Architecture production-ready

---

## V19 - Native Odra Delegation ❌

### Tentative

Utiliser les fonctions natives Odra pour la délégation :

```rust
self.env().delegate(validator, amount, None);
self.env().undelegate(validator, amount, None);
```

### Problème

**Error 64658** (purse mismatch) persistait. Le contrat ne peut pas undéléguer des fonds qu'il a délégués car le "purse" (portefeuille interne) ne correspond pas.

### Leçon Apprise

Sur Casper 2.0, les opérations d'undelegation doivent être faites par la même entité qui a délégué. Un contrat smart ne peut pas facilement récupérer des fonds délégués.

---

## V18 - Delegation Debug ❌

### Fonctionnalités

- Pre-flight checks avant undelegate
- Fonctions de diagnostic pour debugger l'état de délégation
- Logs détaillés des opérations

### Fonctions Debug Ajoutées

```rust
pub fn get_delegation_info(&self, validator: PublicKey) -> DelegationInfo
pub fn check_undelegate_feasibility(&self, validator: PublicKey, amount: U512) -> bool
```

### Problème

Malgré les diagnostics, **Error 64658** continuait. Le problème était fondamental dans l'architecture, pas dans l'implémentation.

### Conclusion

V18 a permis de comprendre que le problème n'était pas un bug mais une limitation architecturale de Casper 2.0.

---

## 🔧 Corrections Sécurité (V22)

Après l'analyse CasperSecure, les corrections suivantes ont été ajoutées :

### 1. Limite harvest_rewards

```rust
pub fn harvest_rewards(&mut self, reward_amount: U512) {
    self.ownable.assert_owner(&self.env().caller());

    // Security: Max 10% of pool to prevent manipulation
    let pool = self.pool_balance.get_or_default();
    let max_reward = pool / U512::from(10);
    if reward_amount > max_reward && pool > U512::zero() {
        self.env().revert(Error::RewardsTooHigh);
    }
    // ...
}
```

### 2. Protection Overflow U512→U256

```rust
fn u512_to_u256(value: U512) -> U256 {
    let mut bytes = [0u8; 64];
    value.to_little_endian(&mut bytes);

    // Check for overflow (bytes 32-63 must be zero)
    for i in 32..64 {
        if bytes[i] != 0 {
            return U256::MAX; // Saturate on overflow
        }
    }
    U256::from_little_endian(&bytes[..32])
}
```

### 3. Nouveaux Codes d'Erreur

| Code | Erreur | Description |
|------|--------|-------------|
| 19 | ContractPaused | Contrat en pause |
| 20 | RewardsTooHigh | Harvest > 10% pool |
| 21 | ValueOverflow | Overflow numérique |

---

## 📊 Évolution des Métriques

| Métrique | V18 | V19 | V20 | V21 | V22 |
|----------|-----|-----|-----|-----|-----|
| **Tests** | 8 | 8 | 10 | 12 | 12 |
| **Entry Points** | 18 | 16 | 20 | 20 | 20 |
| **Lignes Rust** | ~450 | ~420 | ~520 | ~520 | ~540 |
| **Architecture** | Direct | Direct | Pool | Pool | Pool |
| **Statut** | ❌ | ❌ | ✅ | ⚠️ | ✅ |

---

## 🚀 Migration V21 → V22

### Changements Breaking

**Aucun pour les utilisateurs**. Seule la signature interne de `request_unstake` change.

### Pour le Frontend

```typescript
// AVANT (V21 - causait Error 19)
const args = Args.fromMap({
    stcspr_amount: CLValue.newCLU256(amount),  // ❌
});

// APRÈS (V22 - fonctionne)
const args = Args.fromMap({
    stcspr_amount: CLValue.newCLU512(amount),  // ✅
});
```

### Étapes de Migration

1. Redéployer le contrat V22
2. Mettre à jour `config.js` avec nouveau hash
3. ✅ C'est tout!

---

## 🎯 Leçons Clés

1. **Casper 2.0 purse model**: Les contrats ne peuvent pas undéléguer directement → utiliser architecture pool
2. **SDK type matching**: Le type Rust doit correspondre exactement au type JS SDK
3. **Error 19 = LeftOverBytes**: Souvent un problème de type (U256 vs U512)
4. **Error 64658 = Purse mismatch**: Problème architectural, pas de bug

---

## 📝 Fichiers Modifiés

### V22
- `stakevue_contract/src/lib.rs` - U512 pour request_unstake
- `client/src/services/transaction.ts` - Fix entry point claim
- `client/src/components/StakingForm.tsx` - Fix request ID tracking

### V20
- Architecture complètement réécrite
- Nouveaux entry points admin_*
- Suppression des appels directs à auction contract

---

## 🔗 Liens Utiles

| Resource | URL |
|----------|-----|
| **V22 Contract** | [Testnet Explorer](https://testnet.cspr.live/contract/2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3) |
| **Frontend** | https://casper-projet.vercel.app |
| **Odra Docs** | https://odra.dev |
| **Casper Docs** | https://docs.casper.network |

---

*Dernière mise à jour: 21 Décembre 2025*
