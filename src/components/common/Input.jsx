import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={cn('input', error && 'border-red-500 focus:ring-red-500', className)} {...props} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;
