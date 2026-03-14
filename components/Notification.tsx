import { Info, X } from "lucide-react";
import { useEffect } from "react";

type NotificationProps = {
  id: string | number;
  message: string;
  type?: NotificationType;
  time?: number;
  callback: (id: string | number) => void;
};

const TYPE_STYLES: Record<NotificationType, string> = {
  process: "bg-blue-50 text-blue-900 border-blue-200",
  warn: "bg-amber-50 text-amber-900 border-amber-200",
  error: "bg-rose-50 text-rose-900 border-rose-200",
};

export const removeNotification = (
  time: number,
  id: string | number,
  callback: (id: string | number) => void,
): ReturnType<typeof setTimeout> | null => {
  if (time === 0) return null;

  return setTimeout(() => {
    callback(id);
  }, time);
};

const Notification = ({
  id,
  message,
  type = "process",
  time = 3000,
  callback,
}: NotificationProps) => {
  useEffect(() => {
    removeNotification(time, id, callback);

  }, []);

  return (
    <div
      className={`notification max-w-sm w-full flex items-center justify-center gap-3 border rounded-lg p-3 shadow-sm ${TYPE_STYLES[type]}`}
    >
      <Info className="w-5 h-5 mt-0.5" />

      <p className="flex-1 text-sm leading-5">{message}</p>

      <button
        type="button"
        className="shrink-0 text-inherit hover:opacity-70 transition-opacity"
        aria-label="Close notification"
        onClick={(event) => {
          event.stopPropagation();
          callback(id);
        }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;
