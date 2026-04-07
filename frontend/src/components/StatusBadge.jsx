import React from "react";

const StatusBadge = ({ status }) => {
  const styles = {
    ok: "bg-green-100 text-green-700 border border-green-300",
    online: "bg-green-100 text-green-700 border border-green-300",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    danger: "bg-red-100 text-red-700 border border-red-300",
    offline: "bg-red-100 text-red-700 border border-red-300"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.warning}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
