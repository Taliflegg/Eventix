import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAddUserActivity } from "../services/userActivityService";
import { fetchAuthenticatedUser, userAccount } from "../services/usersService";
import { useAuth } from '../context/AuthContext';

function AppHome() {

  const { t }: { t: (key: string) => string } = useTranslation();
  const [userId, setUserId] = useState<string>("");

  const navigate = useNavigate();
  const { user } = useAuth();

  const goToPage = async (appName: string) => {

    if (appName === "Shabbat") {
      const result = await userAccount(userId);
      const r = JSON.stringify(result.accountId)
      if (r === "" || r === undefined || r === "null")
        navigate("/shabbat-signUp");
      else {
        navigate("/shabbat");
      }
    }
    // if(appName==="Events"){
    //     navigate("/events")
    // }

    if (appName === "Events" && user?.role == 'administrator') {
      navigate("/events")
    }
    else if(appName === "Events") {
      navigate("/user-events")
    }
    if (appName === "MealTrain") {
      navigate("/mealTrain")
    }
    await handleAddActivity(appName);
  }

  useEffect(() => {
    async function loadUser() {
      const userData = await fetchAuthenticatedUser();
      setUserId(userData.id)
    }
    loadUser();
  }, [])

  const handleAddActivity = async (appName: string) => {
    try {
      const response = await fetchAddUserActivity(appName);
      console.log('Activity added:', response);
    }
    catch (error: any) {
      console.error(error);
      toast.error('Activity added failed: ' + (error.message || 'Unknown error'));
    }
  };

  return <>
    <div className="flex flex-col items-center space-y-6 p-4">

      <div className="bg-white rounded-xl shadow-md p-5 max-w-md w-full text-center transition transform hover:-translate-y-1 hover:shadow-lg"
        onClick={() => goToPage('Shabbat')}>
        <div className="text-3xl mb-2">🕯️</div>
        <div className="text-lg font-semibold">{t('AppHome.shabat_title')}</div>
        <div className="text-sm text-gray-500 mb-3">{t('AppHome.shabat_second_title')}</div>
        <p className="text-gray-600 text-sm">{t("AppHome.shabat_description")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 max-w-md w-full text-center transition transform hover:-translate-y-1 hover:shadow-lg "
        onClick={() => goToPage("Events")}>
        <div className="text-3xl mb-2">🥗</div>
        <div className="text-lg font-semibold" onClick={() => navigate("ניתוב לקומפוננטה שלך")}>{t('AppHome.event_title')}</div>
        <div className="text-sm text-gray-500 mb-3">{t('AppHome.event_second_title')}</div>
        <p className="text-gray-600 text-sm">{t("AppHome.event_description")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 max-w-md w-full text-center transition transform hover:-translate-y-1 hover:shadow-lg "
        onClick={() => goToPage("MealTrain")}>
        <div className="text-3xl mb-2">🍲</div>
        <div className="text-lg font-semibold">{t('AppHome.meal_train_title')} </div>
        <div className="text-sm text-gray-500 mb-3">{t('AppHome.meal_train_second_title')} </div>
        <p className="text-gray-600 text-sm">{t('AppHome.meal_train_description')}</p>
      </div>

    </div>

  </>
}
export default AppHome