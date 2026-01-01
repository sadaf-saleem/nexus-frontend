import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const getStrength = () => {
    if (password.length === 0) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  if (password.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength.label === 'Weak' ? 'text-red-600' :
          strength.label === 'Fair' ? 'text-yellow-600' :
          strength.label === 'Good' ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className={`flex items-center gap-2 ${checks.length ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.length ? <Check size={14} /> : <X size={14} />}
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.uppercase ? <Check size={14} /> : <X size={14} />}
          <span>One uppercase letter</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.lowercase ? <Check size={14} /> : <X size={14} />}
          <span>One lowercase letter</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.number ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.number ? <Check size={14} /> : <X size={14} />}
          <span>One number</span>
        </div>
        <div className={`flex items-center gap-2 ${checks.special ? 'text-green-600' : 'text-gray-500'}`}>
          {checks.special ? <Check size={14} /> : <X size={14} />}
          <span>One special character</span>
        </div>
      </div>
    </div>
  );
};

