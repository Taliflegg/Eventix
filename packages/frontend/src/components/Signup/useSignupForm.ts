import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as yup from "yup";
import { registerUser } from "../../services/authService";

export function useSignupForm(profileImageBase64: string, profileImageFile?: File | null) {
  const navigate = useNavigate();
  const { t }: { t: (key: string) => string } = useTranslation();

  const schema = yup.object().shape({
    username: yup.string().required(t("signupForm.errors.usernameRequired")),
    email: yup.string().email(t("signupForm.errors.invalidEmail")).required(t("signupForm.errors.emailRequired")),
    password: yup
      .string()
      .required(t("signupForm.errors.passwordRequired"))
      .min(8, t("signupForm.errors.passwordMin"))
      .matches(/[A-Z]/, t("signupForm.errors.passwordUppercase"))
      .matches(/[^a-zA-Z0-9]/, t("signupForm.errors.passwordSpecial")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("signupForm.errors.passwordsMismatch"))
      .required(t("signupForm.errors.confirmPasswordRequired")),
    language: yup.mixed<'he' | 'en'>().optional(),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    // reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const passwordValue = watch("password");

  useEffect(() => {
    if (!passwordValue) return setPasswordStrength(0);
    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/[^a-zA-Z0-9]/.test(passwordValue)) strength++;
    setPasswordStrength(strength);
  }, [passwordValue]);

  const setLanguage = (lang: "he" | "en") => {
    setValue("language", lang);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setServerError("");
      let profileImageUrl = null;
      if (profileImageFile) {
        // upload image to backend
        const formData = new FormData();
        formData.append('file', profileImageFile);
        // you may need to get userId after registration, but for signup, use a temp endpoint or handle after registration
        // for now, skip image upload if no endpoint for pre-user
        // profileImageUrl = await uploadProfileImage(formData); // implement this if you have endpoint
      }
      const payload = {
        username: data.username,
        email: data.email.toLowerCase(),
        password: data.password,
        language: data.language || 'he',
        dietaryRestrictions: selectedDietaryRestrictions,
        profileImage: profileImageUrl || profileImageBase64 || null,
      };
      await registerUser(payload);

      // toast.success(t("signupForm.google.success"));
      setTimeout(() => {
        const s = localStorage.getItem('eventSharedUrl');
        if (s != null) {
          localStorage.removeItem('eventSharedUrl');
          navigate(s);
        } else {
          navigate('/verify');
        }
      }, 2000);
    } catch (error: any) {
      console.log("🔥 שגיאה מהשרת:", error);

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || "";

        if (status === 409 || serverMessage.toLowerCase().includes("already")) {
          toast.error(t("signupForm.google.emailExists"));
        } else if (status === 400 && serverMessage.toLowerCase().includes("password")) {
          toast.error(t("signupForm.google.passwordInvalid"));
        } else {
          toast.error(t("signupForm.google.generalError"));
        }

      } else {
        const message = error instanceof Error ? error.message : String(error);

        if (message.toLowerCase().includes("user already exists")) {
          toast.error(t("signupForm.google.emailExists"));
        } else {
          toast.error(t("signupForm.google.generalError"));
        }

        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    showPassword,
    setShowPassword,
    loading,
    serverError,
    passwordValue,
    passwordStrength,
    selectedDietaryRestrictions,
    setSelectedDietaryRestrictions,
    setLanguage,
    watch
  };
}
