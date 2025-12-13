/**
 * ValidatorSelector Component for StakeVue V19
 * Custom styled dropdown with validator logos
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ValidatorInfo,
  getApprovedValidatorsInfo,
  getRecommendedValidator,
} from '../../services/validatorService';
import './ValidatorSelector.css';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        // Auto-select recommended validator if none selected
        if (!selectedValidator && data.length > 0) {
          const recommended = getRecommendedValidator(data);
          if (recommended) {
            onSelect(recommended.publicKey);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load validators');
      } finally {
        setLoading(false);
      }
    };

    fetchValidators();
  }, [approvedPublicKeys, baseAPY]);

  // Get selected validator info
  const selectedInfo = validators.find(v => v.publicKey === selectedValidator);
  const recommended = getRecommendedValidator(validators);

  const handleSelect = (publicKey: string) => {
    onSelect(publicKey);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="validator-selector-v2">
        <label className="validator-label">Choisir un Validateur</label>
        <div className="validator-trigger loading">
          <div className="loading-spinner"></div>
          <span>Chargement des validateurs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="validator-selector-v2">
        <label className="validator-label">Choisir un Validateur</label>
        <div className="validator-trigger error">
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`validator-selector-v2 ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <label className="validator-label">Choisir un Validateur</label>

      {/* Selected validator display / trigger */}
      <div
        className={`validator-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedInfo ? (
          <div className="selected-validator">
            <div className="validator-avatar">
              {selectedInfo.logo ? (
                <img src={selectedInfo.logo} alt={selectedInfo.name} />
              ) : (
                <div className="avatar-placeholder">
                  {selectedInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="validator-main-info">
              <span className="validator-name">{selectedInfo.name}</span>
              <span className="validator-rank">#{selectedInfo.rank}</span>
            </div>
            <div className="validator-quick-stats">
              <span className="stat apy">{selectedInfo.estimatedAPY.toFixed(1)}% APY</span>
              <span className="stat fee">{selectedInfo.commission}% fee</span>
            </div>
          </div>
        ) : (
          <div className="placeholder">
            <span>Sélectionner un validateur...</span>
          </div>
        )}
        <div className="dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10z"/>
          </svg>
        </div>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="validator-dropdown-list">
          {validators.map((v) => {
            const isSelected = v.publicKey === selectedValidator;
            const isRecommended = v.publicKey === recommended?.publicKey;

            return (
              <div
                key={v.publicKey}
                className={`validator-option ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
                onClick={() => handleSelect(v.publicKey)}
              >
                {isRecommended && <div className="recommended-tag">⭐ Recommandé</div>}

                <div className="option-content">
                  <div className="validator-avatar">
                    {v.logo ? (
                      <img src={v.logo} alt={v.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="validator-details">
                    <div className="validator-header">
                      <span className="name">{v.name}</span>
                      <span className="rank">#{v.rank}</span>
                    </div>

                    <div className="validator-stats">
                      <span className="stat">
                        <span className="label">APY</span>
                        <span className="value green">{v.estimatedAPY.toFixed(1)}%</span>
                      </span>
                      <span className="stat">
                        <span className="label">Fee</span>
                        <span className={`value ${v.commission <= 5 ? 'green' : ''}`}>{v.commission}%</span>
                      </span>
                      <span className="stat">
                        <span className="label">Perf</span>
                        <span className={`value ${v.performance >= 99 ? 'green' : ''}`}>{v.performance}%</span>
                      </span>
                      <span className="stat">
                        <span className="label">Délég.</span>
                        <span className="value">{v.delegatorsCount}</span>
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="check-icon">✓</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ValidatorSelector;
