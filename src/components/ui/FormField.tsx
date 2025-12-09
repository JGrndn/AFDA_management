import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: any; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  helpText,
}: FormFieldProps) {
  const handleChange = (e: any) => {
    if (type === 'checkbox') {
      onChange(e.target.checked);
    } else if (type === 'number') {
      onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  const inputClasses = `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
    disabled ? 'bg-gray-100' : ''
  }`;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
          className={inputClasses}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">Select...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="mt-2">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
        />
      )}

      {helpText && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}