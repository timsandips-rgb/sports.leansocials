export default function Flag({ code, flag, name, size = 'md' }) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' };
  return <span className={sizes[size]} title={name || code}>{flag || '🏳️'}</span>;
}
