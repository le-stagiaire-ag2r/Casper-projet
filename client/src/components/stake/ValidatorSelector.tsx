/**
 * ValidatorSelector Component for StakeVue V17
 * Displays approved validators with all info for easy comparison
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ValidatorInfo,
  ValidatorSortOption,
  getApprovedValidatorsInfo,
  sortValidators,
  filterValidators,
  getRecommendedValidator,
} from '../../services/validatorService';

interface ValidatorSelectorProps {
  approvedPublicKeys: string[];
  selectedValidator: string | null;
  onSelect: (publicKey: string) => void;
  baseAPY?: number;
  disabled?: boolean;
}

const ValidatorSelector: React.FC<ValidatorSelectorProps> = ({
  approvedPublicKeys,
  selectedValidator,
  onSelect,
  baseAPY = 10,
  disabled = false,
}) => {
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ValidatorSortOption>('apy');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPerformance: 0,
    maxCommission: 100,
    activeOnly: true,
  });

  // Fetch validators
  useEffect(() => {
    const fetchValidators = async () => {
      if (approvedPublicKeys.length === 0) {
        setValidators([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getApprovedValidatorsInfo(approvedPublicKeys, baseAPY);
        setValidators(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load validators');
      } finally {
        setLoading(false);
      }
    };

    fetchValidators();
  }, [approvedPublicKeys, baseAPY]);

  // Sort and filter validators
  const displayedValidators = useMemo(() => {
    const filtered = filterValidators(validators, filters);
    return sortValidators(filtered, sortBy);
  }, [validators, sortBy, filters]);

  // Recommended validator
  const recommended = useMemo(() => {
    return getRecommendedValidator(validators);
  }, [validators]);

  if (loading) {
    return (
      <div className="validator-selector loading">
        <div className="spinner" />
        <p>Chargement des validateurs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="validator-selector error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  if (validators.length === 0) {
    return (
      <div className="validator-selector empty">
        <p>Aucun validateur disponible</p>
      </div>
    );
  }

  return (
    <div className={`validator-selector ${disabled ? 'disabled' : ''}`}>
      {/* Header with sort/filter controls */}
      <div className="validator-header">
        <h3>Choisir un Validateur</h3>

        <div className="controls">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ValidatorSortOption)}
            disabled={disabled}
          >
            <option value="apy">Meilleur APY</option>
            <option value="commission">Commission la + basse</option>
            <option value="performance">Meilleure Performance</option>
            <option value="totalStake">Total Staké</option>
            <option value="delegators">+ Populaire</option>
            <option value="rank">Rang</option>
          </select>

          {/* Filter toggle */}
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            🎛️ Filtres
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-item">
            <label>Performance min: {filters.minPerformance}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minPerformance}
              onChange={(e) =>
                setFilters({ ...filters, minPerformance: Number(e.target.value) })
              }
            />
          </div>
          <div className="filter-item">
            <label>Commission max: {filters.maxCommission}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.maxCommission}
              onChange={(e) =>
                setFilters({ ...filters, maxCommission: Number(e.target.value) })
              }
            />
          </div>
          <div className="filter-item">
            <label>
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) =>
                  setFilters({ ...filters, activeOnly: e.target.checked })
                }
              />
              Actifs uniquement
            </label>
          </div>
        </div>
      )}

      {/* Recommended validator highlight */}
      {recommended && (
        <div
          className={`validator-card recommended ${
            selectedValidator === recommended.publicKey ? 'selected' : ''
          }`}
          onClick={() => !disabled && onSelect(recommended.publicKey)}
        >
          <div className="recommended-badge">⭐ Recommandé</div>
          <ValidatorCard validator={recommended} />
        </div>
      )}

      {/* Validator list */}
      <div className="validator-list">
        {displayedValidators
          .filter((v) => v.publicKey !== recommended?.publicKey)
          .map((validator) => (
            <div
              key={validator.publicKey}
              className={`validator-card ${
                selectedValidator === validator.publicKey ? 'selected' : ''
              }`}
              onClick={() => !disabled && onSelect(validator.publicKey)}
            >
              <ValidatorCard validator={validator} />
            </div>
          ))}
      </div>

      {displayedValidators.length === 0 && (
        <p className="no-results">Aucun validateur ne correspond aux filtres</p>
      )}
    </div>
  );
};

// Individual validator card component
const ValidatorCard: React.FC<{ validator: ValidatorInfo }> = ({ validator }) => {
  return (
    <div className="card-content">
      {/* Logo and name */}
      <div className="validator-identity">
        {validator.logo ? (
          <img src={validator.logo} alt={validator.name} className="validator-logo" />
        ) : (
          <div className="validator-logo placeholder">
            {validator.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="validator-name">
          <strong>{validator.name}</strong>
          <span className="rank">#{validator.rank}</span>
        </div>
      </div>

      {/* Key stats */}
      <div className="validator-stats">
        <div className="stat highlight">
          <span className="label">APY</span>
          <span className="value green">{validator.estimatedAPY.toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="label">Commission</span>
          <span className={`value ${validator.commission <= 5 ? 'green' : validator.commission >= 15 ? 'red' : ''}`}>
            {validator.commission}%
          </span>
        </div>
        <div className="stat">
          <span className="label">Performance</span>
          <span className={`value ${validator.performance >= 99 ? 'green' : validator.performance < 95 ? 'red' : ''}`}>
            {validator.performance}%
          </span>
        </div>
        <div className="stat">
          <span className="label">Staké</span>
          <span className="value">{validator.totalStakeFormatted}</span>
        </div>
        <div className="stat">
          <span className="label">Délégateurs</span>
          <span className="value">{validator.delegatorsCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="validator-badges">
        {validator.performance >= 99 && <span className="badge perf">🏆 Top Perf</span>}
        {validator.commission <= 5 && <span className="badge fee">💰 Low Fee</span>}
        {validator.rank <= 10 && <span className="badge rank">⭐ Top 10</span>}
        {!validator.isActive && <span className="badge inactive">⚠️ Inactif</span>}
      </div>
    </div>
  );
};

export default ValidatorSelector;
