import React from "react";
import { Notification } from "../hooks/useNotifications";

interface Props {
  notifications: Notification[];
}

const NotificationList: React.FC<Props> = ({ notifications }) => (
  <div className="fixed right-4 top-20 z-50 space-y-2">
    {notifications.map((n) => (
      <div
        key={n.id}
        className={`max-w-sm transform rounded-lg p-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${
          n.type === "success"
            ? "bg-green-500/90 text-white"
            : n.type === "error"
            ? "bg-red-500/90 text-white"
            : "bg-mbhs-blue/90 text-white"
        }`}
      >
        <p className="text-sm font-medium">{n.message}</p>
      </div>
    ))}
  </div>
);

export default NotificationList;
