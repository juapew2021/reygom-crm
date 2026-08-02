function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">{title}</h2>

          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;