import React, { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import { fetchDietaryRestrictions, DietaryOption } from "../services/apiServices";
import { useTranslation } from "react-i18next";

const FaPenIcon = FaPen as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
interface Props {
  selected: string[]; // array of selected dietary restriction IDs
  onChange: (newList: string[]) => void;
}

const DietaryRestrictionsList: React.FC<Props> = ({ selected, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>([]);
  const { t }: { t: (key: string) => string } = useTranslation();

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await fetchDietaryRestrictions();
        setDietaryOptions(options);
      } catch (error) {
        console.error("Failed to load dietary restrictions", error);
      }
    };
    loadOptions();
  }, []);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">{t('signupForm.dietary.label')}</label>
        <FaPenIcon
          className="text-gray-500 hover:text-green-600 cursor-pointer"
          onClick={() => setIsEditing((prev) => !prev)}
        />
      </div>

      {!isEditing ? (
        <div className="text-sm text-gray-700">
          {selected.length > 0
            ? selected
              .map((id) => dietaryOptions.find((opt) => opt.id === id)?.name || id)
              .join(", ")
            : "לא נבחרו מגבלות תזונתיות"}
        </div>
      ) : (
        <div className="space-y-1">
          {dietaryOptions.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`diet-${option.id}`}
                checked={selected.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                className="accent-green-600"
              />
              <label htmlFor={`diet-${option.id}`} className="text-gray-700">
                {option.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DietaryRestrictionsList;
