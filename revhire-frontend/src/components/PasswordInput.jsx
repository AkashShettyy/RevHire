import { useId, useState } from "react";

const eyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
  </svg>
);

const eyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3l18 18" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.88 5.09A10.94 10.94 0 0112 4.88c6 0 9.75 7.12 9.75 7.12a18.98 18.98 0 01-4.04 4.95" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6.61 6.61A19.44 19.44 0 002.25 12s3.75 6.75 9.75 6.75c1.88 0 3.56-.55 5.03-1.39" />
  </svg>
);

function PasswordInput({ label, name, value, onChange, placeholder, required = false, autoComplete, className = "input-field", id, ...props }) {
  const generatedId = useId();
  const inputId = id || `${name}-${generatedId}`;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && <label htmlFor={inputId} className="label-text">{label}</label>}
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`${className} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-surface-400 hover:text-brand-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? eyeOffIcon : eyeIcon}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
