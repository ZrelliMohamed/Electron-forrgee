
const CustomConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default CustomConfirmDialog;
