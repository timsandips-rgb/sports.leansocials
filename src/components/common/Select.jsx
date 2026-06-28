import { cn } from '../../utils/helpers';

export default function Select({ label, error, className, children, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select className={cn('input', error && 'border-red-500', className)} {...props}>{children}</select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
