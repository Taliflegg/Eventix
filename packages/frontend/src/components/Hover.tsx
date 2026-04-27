import React, { useState } from "react";

type Props = {
  label: string;
  baseColor: string;
  hoverBg: string;
  hoverColor: string;
  onClick?: () => void;
};

export default function ChoiceButton({
  label,
  baseColor,
  hoverBg,
  hoverColor,
  onClick
}: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        flex: 1,
        padding: 12,
        border: `2px solid ${baseColor}`,
        background: hovered ? hoverBg : "white",
        color: hovered ? hoverColor : baseColor,
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s ease"
      }}
    >
      {label}
    </button>
  );
}
