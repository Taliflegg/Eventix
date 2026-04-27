import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuthenticatedUser, registerWithGoogle } from "../../services/authService";

export function GoogleAuthButton() {
  const navigate = useNavigate();
 const { t }: { t: (key: string) => string } = useTranslation();
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const result = await registerWithGoogle(credentialResponse.credential);

        if (result.isNewUser) {
          const user = await getAuthenticatedUser();
          localStorage.setItem("currentUser", JSON.stringify(user));

          toast.success(t("signupForm.google.success"));
          setTimeout(() => navigate("/AppHome"), 2000);
        } else {
          toast.error(t("signupForm.google.emailExists"));
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        console.error("Google auth error:", error);
        toast.error(t("signupForm.google.error"));
      }
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => toast.error(t("signupForm.google.error"))}
    />
  );
}
