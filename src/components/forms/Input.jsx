function Input({ placeholder, value, onChange, type = "text", required = false }) {
  return (
    <input
      className="border border-gray-400 p-2 rounded text-black w-full"
      placeholder={placeholder}
      value={value}
      type={type}
      required={required}
      onChange={onChange}
    />
  );
}

export default Input;