import { cn } from '../../utils/helpers';

export default function Badge({ variant = 'default', children, className }) {
  const variants = {
    default: 'bg-surface text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-primary',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    accent: 'bg-accent text-white',
  };
  return <span className={cn('badge', variants[variant], className)}>{children}</span>;
}
