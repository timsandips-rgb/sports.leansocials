import { cn } from '../../utils/helpers';

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  const variants = {
    primary: 'btn-primary', secondary: 'btn-secondary', success: 'btn-success',
    danger: 'btn-danger', ghost: 'btn-ghost', outline: 'btn border-accent text-accent hover:bg-accent hover:text-white',
  };
  const sizes = { sm: 'text-sm px-3 py-1.5', md: '', lg: 'text-lg px-6 py-3' };
  return (
    <button className={cn(variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
