import { cn } from '../../utils/helpers';

export default function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea className={cn('input min-h-[100px]', error && 'border-red-500', className)} {...props} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
