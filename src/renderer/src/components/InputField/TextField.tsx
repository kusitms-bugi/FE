import { forwardRef } from 'react';

interface TextFieldProps {
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      type = 'text',
      placeholder = '이름을 입력하세요',
      value,
      maxLength,
      disabled,
      onChange,
      onFocus,
      onBlur,
      className = '',
      name,
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`flex aspect-[44/6] w-full cursor-pointer flex-row rounded-full border border-[#E3E1DF] bg-[#ffffff] px-6 outline-none focus:border-yellow-500 ${className}`}
      />
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
