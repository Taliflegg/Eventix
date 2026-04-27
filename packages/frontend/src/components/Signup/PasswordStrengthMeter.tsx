import React from "react";
import { useTranslation } from 'react-i18next';

/**
 * PasswordStrengthMeter component
 * Displays a visual indicator of password strength centered and with Hebrew translation.
 */

export function PasswordStrengthMeter({ strength }: { strength: number }) {
  const { t }: { t: (key: string) => string } = useTranslation();

  if (!strength) return null;

  const colors = ["bg-red-500", "bg-orange-400", "bg-green-500"];
  const labels = [
    t("signupForm.passwordStrengthLabel.weak"),
    t("signupForm.passwordStrengthLabel.medium"),
    t("signupForm.passwordStrengthLabel.strong")
  ];

  const percentage = (strength / 3) * 100;

  return (
    <div className="mt-2 text-center">
      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden flex justify-center">
        <div
          className={`h-2 transition-all duration-300 ${colors[strength - 1] || "bg-red-500"}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-gray-700">
        {t("signupForm.passwordStrengthLabel.label")}: {labels[strength - 1] || labels[0]}
      </p>
    </div>
  );
}
