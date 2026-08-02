function Toast({ message, type = "success" }) {
  if (!message) return null;

  const styles = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <div className={`fixed top-5 right-5 z-50 text-white px-5 py-3 rounded-lg shadow-lg ${styles[type] || styles.success}`}>
      {message}
    </div>
  );
}

export default Toast;