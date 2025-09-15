import { useState, useCallback } from "react";

export type Notification = {
  id: number;
  message: string;
  type: "info" | "success" | "error";
  timestamp: Date;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: Notification["type"] = "info") => {
    const notification: Notification = { id: Date.now(), message, type, timestamp: new Date() };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id)), 5000);
  }, []);

  return { notifications, showNotification };
};
