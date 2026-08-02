function Select({ value, onChange, children, required = false, className = "" }) {
  return (
    <select
      className={`border border-gray-400 p-2 rounded text-black w-full ${className}`}
      value={value}
      required={required}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

export default Select;