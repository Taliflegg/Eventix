import React, { useState } from 'react';

interface ModalWithButtonProps {
  buttonLabel: string;
  children: React.ReactElement<{ onClose: () => void }>;
}

export default function ModalWithButton({ buttonLabel, children }: ModalWithButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>{buttonLabel}</button>

      {isOpen && (
        <div
          style={{
            border: "2px solid #333",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
            border: "2px solid #333",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            {React.cloneElement(children, {
              onClose: () => setIsOpen(false),
            })}
          </div>
        </div>
      )}
    </div>
  );
}