function Button({ children, type = "button", variant = "primary", onClick }) {
  const baseClasses = "px-5 py-2 rounded font-bold transition";

  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-800 text-white",
    danger: "bg-red-700 hover:bg-red-800 text-white",
    edit: "bg-blue-600 hover:bg-blue-700 text-white"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary}`}
    >
      {children}
    </button>
  );
}
console.log("Button cargado");
export default Button;