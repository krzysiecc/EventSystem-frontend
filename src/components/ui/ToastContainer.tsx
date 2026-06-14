import { createPortal } from "react-dom";
import { useToastStore } from "@/store/useToastStore";

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-status-success-bg text-status-success border-status-success";
      case "error":
        return "bg-status-error-bg text-status-error border-status-error";
      case "warning":
        return "bg-status-warning-bg text-status-warning border-status-warning";
      default:
        return "bg-status-info-bg text-status-info border-status-info";
    }
  };

  return createPortal(
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`cursor-pointer rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 animate-fade-in ${getTypeStyles(toast.type)}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>,
    document.body,
  );
};

export default ToastContainer;
