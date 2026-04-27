
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewAccountData } from './OnboadingFlow';
import { fetchAuthenticatedUser } from '../../services/usersService';
import { completeOnboarding } from '../../services/shabbatService';

interface Props {
  onNext: () => void;
  data: NewAccountData;
  setData: React.Dispatch<React.SetStateAction<NewAccountData>>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

function CreateAccount({ onNext, data, setData }: Props) {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [errors, setErrors] = useState<{ accountName?: string; accountType?: string }>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user: User = await fetchAuthenticatedUser();
        setData((prev) => ({
          ...prev,
          id: user.id,
          email: user.email,
        }));
      } catch (error: any) {
        console.error('Error fetching user:', error.message);
      }
    };
    loadUser();
  }, [setData]);

  const handleSelectType = (type: 'family' | 'individual') => {
    setData((prev) => ({ ...prev, accountType: type }));
    setErrors((prev) => ({ ...prev, accountType: undefined }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!data.accountName || data.accountName.trim() === '') {
      newErrors.accountName = t('CreateAccountShabbat.account_name_required');
    }
    if (!data.accountType) {
      newErrors.accountType = t('CreateAccountShabbat.account_type_required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUp = async () => {
    if (!validate()) return;

    // try {
    //   const response = await fetch('/api/onboarding/complete', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       userId: data.id,
    //       email: data.email,
    //       accountName: data.accountName,
    //     }),
    //     credentials: 'include',
    //   });

    //   if (!response.ok) throw new Error('Failed to create account');

    //   onNext();
    // } catch (error) {
    //   console.error('Error during sign up:', error);
    // }
    if (!data.id || !data.email || !data.accountName) {
      console.error("ישנם שדות חסרים. אנא מלא את כל השדות.");
      return;
    }
    try {
      const result = await completeOnboarding(data.id, data.email, data.accountName);
  
      if (result.success) {
        onNext();
      } else {
        console.error("שגיאה בהשלמת ההדרכה:", result.message);
      }
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* כותרת עליונה */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-2">🤝</div>
        <h1 className="text-3xl font-bold mb-1">Yachad</h1>
        <p className="text-gray-600">{t('onboarding_tagline')}</p>
      </div>

      <h2 className="text-center text-2xl font-semibold mb-2">
        {t('CreateAccountShabbat.create_account_title')}
      </h2>
      <p className="text-center text-gray-600 mb-8">
        {t('CreateAccountShabbat.create_account_subtitle')}
      </p>

      {/* שדה שם חשבון */}
      <div className="mb-2">
        <label className="block font-bold mb-2">
          {t('CreateAccountShabbat.account_name')}
        </label>
        <input
          type="text"
          placeholder="David & Sarah"
          value={data.accountName}
          onChange={(e) => {
            setData((prev) => ({ ...prev, accountName: e.target.value }));
            setErrors((prev) => ({ ...prev, accountName: undefined }));
          }}
          className={`w-full px-4 py-3 text-base border-2 rounded-lg box-border focus:outline-none ${errors.accountName ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
        />
        {errors.accountName && (
          <div className="text-red-500 text-sm mt-1">{errors.accountName}</div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="absolute top-[-30px] right-0 bg-black bg-opacity-10 px-2 py-1 rounded-xl text-xs text-gray-600">
        Step 1/6
      </div>

      {/* סוג חשבון */}
      <div className="flex gap-3 mb-2 mt-8 relative">
        <AccountTypeOption
          selected={data.accountType === 'family'}
          icon="👥"
          title={t('CreateAccountShabbat.account_family')}
          desc={t('CreateAccountShabbat.account_family_desc')}
          onClick={() => handleSelectType('family')}
        />

        <AccountTypeOption
          selected={data.accountType === 'individual'}
          icon="👤"
          title={t('CreateAccountShabbat.account_individual')}
          desc={t('CreateAccountShabbat.account_individual_desc')}
          onClick={() => handleSelectType('individual')}
        />
      </div>

      {errors.accountType && (
        <div className="text-red-500 text-sm text-center mt-2 mb-4">{errors.accountType}</div>
      )}

      {/* כפתור המשך */}
      <div className="text-center mt-6">
        <button
          onClick={signUp}
          className="w-full bg-blue-600 text-white px-7 py-4 text-lg font-bold rounded-lg border-none cursor-pointer hover:bg-blue-700 transition-colors"
        >
          {t('CreateAccountShabbat.next')}
        </button>
      </div>
    </div>
  );
}

function AccountTypeOption(props: {
  selected: boolean;
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={props.onClick}
      className={`flex-1 p-5 border-2 rounded-xl cursor-pointer text-center transition-all relative ${props.selected
        ? 'border-blue-600 bg-blue-50'
        : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
    >
      <div className="text-3xl mb-2">{props.icon}</div>
      <div className="font-bold text-base mb-1">{props.title}</div>
      <div className="text-sm text-gray-600">{props.desc}</div>
    </div>
  );
}

export default CreateAccount;

