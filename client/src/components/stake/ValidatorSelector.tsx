/**
 * ValidatorSelector Component for StakeVue V19
 * Compact dropdown for validator selection
 */

import React, { useState, useEffect } from 'react';
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

  if (loading) {
    return (
      <div className="validator-dropdown-container">
        <label className="validator-label">Validateur</label>
        <div className="validator-dropdown loading">
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="validator-dropdown-container">
        <label className="validator-label">Validateur</label>
        <div className="validator-dropdown error">
          <span>Erreur: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="validator-dropdown-container">
      <label className="validator-label">Choisir un Validateur</label>

      <select
        className="validator-select"
        value={selectedValidator || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled || validators.length === 0}
      >
        <option value="" disabled>
          -- Sélectionner un validateur --
        </option>
        {validators.map((v) => (
          <option key={v.publicKey} value={v.publicKey}>
            {v.name} | APY: {v.estimatedAPY.toFixed(1)}% | Fee: {v.commission}% | Perf: {v.performance}%
          </option>
        ))}
      </select>

      {/* Show selected validator details */}
      {selectedInfo && (
        <div className="selected-validator-info">
          <div className="validator-stats-row">
            <span className="stat">
              <strong>APY:</strong> <span className="green">{selectedInfo.estimatedAPY.toFixed(1)}%</span>
            </span>
            <span className="stat">
              <strong>Commission:</strong> {selectedInfo.commission}%
            </span>
            <span className="stat">
              <strong>Performance:</strong> {selectedInfo.performance}%
            </span>
            <span className="stat">
              <strong>Délégateurs:</strong> {selectedInfo.delegatorsCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatorSelector;
