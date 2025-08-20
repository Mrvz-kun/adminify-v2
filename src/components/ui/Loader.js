import React from "react";

export default function Loader({
  message = "Loading...",
  size = "lg",
  center = true,
  className = "",
}) {
  const sizeClass = {
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
    xl: "loading-xl",
  }[size] || "loading-md";

  return (
    <div
      className={`flex flex-col items-center gap-3 text-center text-sm text-neutral ${
        center ? "justify-center py-20" : ""
      } ${className}`}
    >
      <span className={`loading loading-spinner ${sizeClass}`} />
      <p>{message}</p>
    </div>
  );
}
