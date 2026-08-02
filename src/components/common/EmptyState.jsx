function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>

      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {description && (
        <p className="text-gray-500 mt-3">{description}</p>
      )}

      {action && (
        <div className="mt-8">{action}</div>
      )}
    </div>
  );
}

export default EmptyState;