import React, { useEffect, useState } from "react";
import { fetchDietaryRestrictions } from "../../services/apiServices";
import { useTranslation } from "react-i18next";

interface Props {
  selected: string[];
  onChange: (newList: string[]) => void;
}

const DietaryRestrictionsTags: React.FC<Props> = ({ selected, onChange }) => {
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { t }: { t: (key: string) => string } = useTranslation();

 useEffect(() => {
  const fetchOptions = async () => {
    try {
      const options = await fetchDietaryRestrictions();

      const nameMap: Record<string, string> = {
        "כשר": "kosher",
        "צמחוני": "vegetarian",
        "אלרגיה": "allergy",
        "השגחה": "supervision"
      };

      setAllOptions(options.map(opt => nameMap[opt.name] || opt.name));
    } catch (err) {
      console.error("שגיאה בעת טעינת מגבלות תזונה:", err);
      setError("לא ניתן לטעון מגבלות תזונתיות.");
    }
  };
  fetchOptions();
}, []);

  const availableOptions = allOptions.filter((opt) => !selected.includes(opt));

  const addTag = (value: string) => {
    if (value && !selected.includes(value)) {
      onChange([...selected, value]);
    }
  };

  const removeTag = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className="space-y-4 text-right">
      <label className="text-sm font-semibold block text-center">
        {t("signupForm.dietary.label")}
      </label>

      {error && <div className="text-red-600 text-xs">{error}</div>}

      {/* תגיות נבחרות */}
      <div className="flex flex-wrap gap-2">
        {selected.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm"
          >
            <span className="text-gray-800">{t(`signupForm.dietary.${tag}`)}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-red-600 hover:text-red-800 font-bold"
              title={t("signupForm.dietary.removeTag") || "הסר"}
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      {/* Select נפתח */}
      {availableOptions.length > 0 && (
        <select
          onChange={(e) => {
            addTag(e.target.value);
            e.target.selectedIndex = 0; // מחזיר ל־"בחר"
          }}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none"
        >
          <option value="">{t("signupForm.dietary.selectPlaceholder") || "בחר"}</option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {t(`signupForm.dietary.${opt}`)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default DietaryRestrictionsTags;
