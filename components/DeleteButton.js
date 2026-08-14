"use client";

export default function DeleteButton({
  children = "Delete",
  confirmMessage = "Delete this? This can't be undone.",
  className,
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
