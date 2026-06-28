export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-text-secondary text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
