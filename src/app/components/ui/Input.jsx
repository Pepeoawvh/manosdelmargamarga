'use client'
import { useState, forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = '',
  helpText = '',
  className = '',
  fullWidth = true,
  size = 'md',
  leftIcon,
  rightIcon,
  iconClickable = false,
  onIconClick,
  maxLength,
  min,
  max,
  step,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clases base para todos los inputs
  const baseInputClasses = `
    block border rounded-md bg-white focus:outline-none focus:ring-2 transition-all
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-emerald-300 focus:border-emerald-500'}
    ${fullWidth ? 'w-full' : 'w-auto'}
  `;

  // Clases según tamaño
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg',
  };

  // Clases para padding adicional cuando hay íconos
  const iconPaddingClasses = {
    left: leftIcon ? 'pl-9' : '',
    right: rightIcon || type === 'password' ? 'pr-9' : '',
  };

  // Clases completas para el input
  const inputClasses = `
    ${baseInputClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${iconPaddingClasses.left}
    ${iconPaddingClasses.right}
    ${className}
  `;

  // Manejar el cambio de tipo para campos de contraseña
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} mb-4`}>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div 
            className={`absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 ${iconClickable ? 'cursor-pointer hover:text-emerald-600' : ''}`}
            onClick={iconClickable ? onIconClick : undefined}
          >
            {leftIcon}
          </div>
        )}
        
        <input
          id={id || name}
          name={name}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          required={required}
          ref={ref}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          readOnly={readOnly}
          {...props}
        />
        
        {(rightIcon || type === 'password') && (
          <div 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer hover:text-emerald-600"
            onClick={type === 'password' ? () => setShowPassword(!showPassword) : onIconClick}
          >
            {type === 'password' ? (
              showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
      
      {(error || helpText) && (
        <div className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;