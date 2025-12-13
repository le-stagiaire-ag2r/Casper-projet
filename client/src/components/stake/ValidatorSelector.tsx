/**
 * ValidatorSelector Component for StakeVue V17
 * Collapsible accordion style - click to expand/collapse validator list
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ValidatorSelector.css';
import {
  ValidatorInfo,
  ValidatorSortOption,
  getApprovedValidatorsInfo,
  sortValidators,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<ValidatorSortOption>('apy');
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort validators
  const displayedValidators = useMemo(() => {
    return sortValidators(validators, sortBy);
  }, [validators, sortBy]);

  // Get selected validator info
  const selectedValidatorInfo = useMemo(() => {
    return validators.find(v => v.publicKey === selectedValidator);
  }, [validators, selectedValidator]);

  // Recommended validator
  const recommended = useMemo(() => {
    return getRecommendedValidator(validators);
  }, [validators]);

  // Handle validator selection
  const handleSelect = (publicKey: string) => {
    onSelect(publicKey);
    setIsExpanded(false);
  };

  if (loading) {
    return (
      <div className="validator-selector-compact loading">
        <div className="spinner-small" />
        <span>Chargement des validateurs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="validator-selector-compact error">
        <span>Erreur: {error}</span>
      </div>
    );
  }

  if (validators.length === 0) {
    return (
      <div className="validator-selector-compact empty">
        <span>Aucun validateur disponible</span>
      </div>
    );
  }

  return (
    <div
      className={`validator-selector-accordion ${disabled ? 'disabled' : ''}`}
      ref={containerRef}
    >
      {/* Compact header - always visible */}
      <div
        className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
      >
        {selectedValidatorInfo ? (
          <div className="selected-validator">
            <div className="validator-mini">
              {selectedValidatorInfo.logo ? (
                <img src={selectedValidatorInfo.logo} alt="" className="mini-logo" />
              ) : (
                <div className="mini-logo placeholder">
                  {selectedValidatorInfo.name.charAt(0)}
                </div>
              )}
              <div className="mini-info">
                <strong>{selectedValidatorInfo.name}</strong>
                <span className="mini-stats">
                  APY {selectedValidatorInfo.estimatedAPY.toFixed(1)}% | Commission {selectedValidatorInfo.commission}%
                </span>
              </div>
            </div>
            <span className="change-btn">Changer</span>
          </div>
        ) : (
          <div className="select-prompt">
            <span>Choisir un validateur</span>
            <span className="validator-count">{validators.length} disponibles</span>
          </div>
        )}
        <div className={`chevron ${isExpanded ? 'up' : 'down'}`}>▼</div>
      </div>

      {/* Expandable list */}
      {isExpanded && (
        <div className="accordion-content">
          {/* Sort control */}
          <div className="sort-bar">
            <span>Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ValidatorSortOption)}
            >
              <option value="apy">Meilleur APY</option>
              <option value="commission">Commission basse</option>
              <option value="performance">Performance</option>
              <option value="delegators">Popularité</option>
              <option value="rank">Rang</option>
            </select>
          </div>

          {/* Validator list - grid layout */}
          <div className="validators-grid">
            {displayedValidators.map((validator) => (
              <div
                key={validator.publicKey}
                className={`validator-item ${
                  selectedValidator === validator.publicKey ? 'selected' : ''
                } ${validator.publicKey === recommended?.publicKey ? 'recommended' : ''}`}
                onClick={() => handleSelect(validator.publicKey)}
              >
                {validator.publicKey === recommended?.publicKey && (
                  <span className="rec-badge">Recommandé</span>
                )}
                <div className="item-header">
                  {validator.logo ? (
                    <img src={validator.logo} alt="" className="item-logo" />
                  ) : (
                    <div className="item-logo placeholder">
                      {validator.name.charAt(0)}
                    </div>
                  )}
                  <div className="item-name">
                    <strong>{validator.name}</strong>
                    <span className="item-rank">#{validator.rank}</span>
                  </div>
                </div>
                <div className="item-stats">
                  <div className="stat">
                    <span className="label">APY</span>
                    <span className="value green">{validator.estimatedAPY.toFixed(1)}%</span>
                  </div>
                  <div className="stat">
                    <span className="label">Comm.</span>
                    <span className="value">{validator.commission}%</span>
                  </div>
                  <div className="stat">
                    <span className="label">Perf.</span>
                    <span className="value">{validator.performance}%</span>
                  </div>
                </div>
                {validator.publicKey === selectedValidator && (
                  <div className="selected-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatorSelector;
