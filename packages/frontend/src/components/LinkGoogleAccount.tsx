import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { linkGoogleAccount } from '../services/usersService';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    google: any;
  }
}

interface LinkGoogleAccountProps {
  onLinked: (googleId: string) => void;
}

const LinkGoogleAccount = ({ onLinked }: LinkGoogleAccountProps) => {
  const { t }: { t: (key: string) => string } = useTranslation();
  const handleCredentialResponse = async (response: any) => {
    const token = response.credential;
    try {
      const { googleId } = await linkGoogleAccount(token);
      onLinked(googleId)
      toast.success(t('LinkGoogleAccount.link_google_success'));
    } catch (error: any) {
      console.error(error);
      toast.error(t('LinkGoogleAccount.link_google_error'));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.accounts && document.getElementById("google-signin-button")) {
        clearInterval(interval);
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button")!,
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: "250",
            locale: "en",
            logo_alignment: "left"
          }
        );
      }
    }, 100);
    return () => clearInterval(interval);
  }, [handleCredentialResponse]);

  return (
    <div>
      <div id="google-signin-button"></div>
    </div>
  );
};
export default LinkGoogleAccount;