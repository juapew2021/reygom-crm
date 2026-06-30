function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>

        {subtitle && (
          <p className="text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>

      {actions && <div>{actions}</div>}
    </div>
  );
}

export default PageHeader;
