import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';


const JoinAccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [accountName, setAccountName] = useState<string | null>(null);
  const { t }: { t: (key: string) => string } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const navigate = useNavigate();


  const handleError = (error: any) => {
    if (error?.response?.status === 401) {
      toast.error(t('JoinAccount.errors.unauthorized'), { toastId: 'auth-error' });
    } else {
      toast.error(t('JoinAccount.errors.general'), { toastId: 'general-error' });
    }
    console.error('שגיאה בהצטרפות לחשבון:', error);
  };
  
  const handleAccountJoin = async () => {
    if (!accountId) {
      toast.error(t('JoinAccount.errors.missingAccountId'));
      return;
    }
  
    if (!accountName) {
      toast.error(t('JoinAccount.errors.missingAccountName'));
      return;
    }
  
    try {
      console.log(`מאשר הצטרפות ל: ${accountName}`);
      await accountService.updateUserAccount(accountId);
      toast.success(`${t('JoinAccount.confirmation_message')}"${accountName}"!`);
      navigate("/shabbat")
    } catch (error) {
      handleError(error);
    }
  };
  
  useEffect(() => {
    const fetchAccountName = async () => {
      setLoading(true);
      try {
        const name = await accountService.getAccountName();
        setAccountName(name);
        setNotAuthorized(false);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          localStorage.setItem('eventSharedUrl', window.location.pathname + window.location.search);
          setNotAuthorized(true);
          toast.info(t('JoinAccount.errors.unauthorized'));
        } else {
          toast.error(t('JoinAccount.errors.loadingAccountName'));
        }
        console.error('Failed to fetch account name:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAccountName();
  }, [accountId]);


  if (notAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-4">עליך להתחבר</h2>
          <p className="mb-6">כדי להצטרף לחשבון, אנא התחבר/י קודם.</p>
          <button
            onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
          >
            להתחברות
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {t('JoinAccount.title')}
        </h1>

        <p className="text-gray-600 text-sm mb-1">
          {t('JoinAccount.account_name')}{' '}
          <span className="font-medium text-gray-900">{accountName}</span>
        </p>

        <p className="text-gray-600 text-sm mb-6">
          {t('JoinAccount.description')}
        </p>

        <button
          onClick={handleAccountJoin}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition duration-200"
          disabled={!accountId || !accountName}
        >
          {t('JoinAccount.confirm_button')}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          {t('JoinAccount.confirmation_note')} <span className="font-medium">{accountName}</span>
        </p>
      </div>
    </div>
  );
};

export default JoinAccountPage;