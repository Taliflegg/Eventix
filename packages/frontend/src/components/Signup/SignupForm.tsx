import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSignupForm } from "./useSignupForm";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/outline';
import DietaryRestrictionsList from "../Signup/DietaryRestrictionsLis";
import { GoogleAuthButton } from './GoogleAuthButton';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../css/Login.module.css';
import { useNavigate } from 'react-router-dom';
// הוספת הייבוא של קומפוננטת טעינת תמונת הפרופיל
import { ProfileImageUploader } from "./ProfileImageUploader";
export default function SignupForm() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    onSubmit,
    loading,
    errors,
    serverError,
    showPassword,
    setShowPassword,
    passwordStrength,
    setSelectedDietaryRestrictions,
    selectedDietaryRestrictions,
    setLanguage,
    watch
  } = useSignupForm(profileImageBase64 || "", profileImageFile); // pass both arguments
  // פונקציה שתעביר את הבסיס64 מהקומפוננטה
  const handleImageChange = (base64: string | null, file?: File | null) => {
    setProfileImageBase64(base64);
    setProfileImageFile(file || null);
  };
  return (
    <div dir="rtl" className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t('signupForm.title')}</h2>
        <div className="flex justify-center mb-4">
          <GoogleAuthButton />
        </div>
        {serverError && (
          <div className="mb-4 text-red-600 border border-red-400 bg-red-100 rounded p-2 text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* שם משתמש */}
          <div>
            <label className={styles.label}>{t('signupForm.username')}</label>
            <input
              type="text"
              {...register("username")}
              className={`${styles.input} ${errors.username ? styles.errorText : ""}`}
            />
            {errors.username && (
              <p className={styles.errorText}>{errors.username.message}</p>
            )}
          </div>
          {/* אימייל */}
          <div>
            <label className={styles.label}>{t('signupForm.email')}</label>
            <input
              type="email"
              {...register("email")}
              className={`${styles.input} ${errors.email ? styles.errorText : ""}`}
            />
            {errors.email && (
              <p className={styles.errorText}>{errors.email.message}</p>
            )}
          </div>
          {/* סיסמה */}
          <div>
            <label className={styles.label}>{t('signupForm.password')}</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`${styles.input} ${errors.password ? styles.errorText : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.icon}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {errors.password?.message || t('signupForm.passwordHint')}
            </p>
          </div>
          <PasswordStrengthMeter strength={passwordStrength} />
          {/* אישור סיסמה */}
          <div>
            <label className={styles.label}>{t('signupForm.confirmPassword')}</label>
            <input
              type="password"
              {...register("confirmPassword")}
              onPaste={(e) => e.preventDefault()}
              className={`${styles.input} ${errors.confirmPassword ? styles.errorText : ""}`}
            />
            {errors.confirmPassword && (
              <p className={styles.errorText}>{errors.confirmPassword.message}</p>
            )}
          </div>
          {/* שפת ממשק */}
          <div className="text-center my-4">
            <label className="block mb-2 text-base font-semibold">{t('signupForm.language')}</label>
            <div className="inline-flex bg-gray-200 rounded-full p-1 transition-all shadow-md">
              <button
                type="button"
                onClick={() => setLanguage("he")}
                className={`px-6 py-2 rounded-full text-base font-medium transition-all ${watch("language") === "he" ? "bg-green-600 text-white" : "text-gray-600"}`}
              >
                HE
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-6 py-2 rounded-full text-base font-medium transition-all ${watch("language") === "en" ? "bg-green-600 text-white" : "text-gray-600"}`}
              >
                EN
              </button>
            </div>
            <input type="hidden" {...register("language" as const)} />
            {errors.language && (
              <p className={styles.errorText}>{errors.language.message}</p>
            )}
          </div>
          {/* מגבלות תזונה */}
          <div className="mt-4">
            <DietaryRestrictionsList
              selected={selectedDietaryRestrictions}
              onChange={setSelectedDietaryRestrictions}
            />
          </div>
          {/* כאן מחליפים את שדה הקובץ בקומפוננטה ProfileImageUploader */}
          <div className="mt-4">
            <label className={styles.label}>{t('signupForm.profileImage') || "תמונת פרופיל"}</label>
            <ProfileImageUploader
              imageBase64={profileImageBase64}
              onImageChange={handleImageChange}
            />
          </div>
          {/* כפתור שליחה */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-green-400 rounded-full animate-spin"></span>
            )}
            {loading ? t('signupForm.sending') : t('signupForm.submit')}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('signupForm.alreadyHaveAccount') || "כבר יש לך חשבון?"}{" "}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-green-600 hover:underline font-medium"
            >
              {t('signupForm.loginHere') || "התחבר/י כאן"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}





