import Modal from "./Modal";
import Button from "./Button";

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="text-gray-600 mb-6">{message}</p>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>

        <Button variant="danger" onClick={onConfirm}>
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;