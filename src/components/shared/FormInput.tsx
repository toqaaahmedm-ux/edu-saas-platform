// src/components/shared/FormInput.tsx
import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

const FormInput: React.FC<FormInputProps> = ({ label, type = "text", placeholder, error, register }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`p-2 border rounded-md outline-none transition-all ${
          error ? "border-red-500 focus:ring-1 ring-red-500" : "border-gray-300 focus:border-blue-500"
        }`}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default FormInput;