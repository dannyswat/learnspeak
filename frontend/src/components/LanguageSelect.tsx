import React from 'react';
import type { Language } from '../types/word';

interface LanguageSelectProps {
  label?: string;
  value: number | null;
  onChange: (languageId: number) => void;
  languages: Language[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
}

/**
 * Reusable language dropdown component
 */
const LanguageSelect: React.FC<LanguageSelectProps> = ({
  label = 'Target Language',
  value,
  onChange,
  languages,
  required = false,
  disabled = false,
  placeholder = 'Select a language',
  showLabel = true,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    if (selectedId) {
      onChange(selectedId);
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name} ({lang.code})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelect;
