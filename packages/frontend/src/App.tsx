import './App.css';
import { CssBaseline } from '@mui/material';
import { enUS, heIL } from '@mui/material/locale';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AcquisitionChart from './components/AcquisitionChart';
import Analytics from './components/Analytics';
import OnboardingFlow from './components/CreateAccount/OnboadingFlow';
import EventDetails from './components/EventDetails';
import EventShareRouter from './components/EventShare/EventShareRouter';
import EventsList from './components/EventsList';
import EventStatisticsCard from './components/EventsStatistics';
import GeneralStatisticsCard from './components/GeneralStatistics';
import AppHome from './components/HomePage';
import Login from './components/Login';
import LoginPage from './components/LoginPage';
import MealsStatisticsCard from './components/MealsStatistics';
import MenuDisplay from './components/MenuDisplay';
import MonthlyActiveUsersByApp from './components/MonthlyActiveUsersByApp';

import ShabbatMainScreen from './components/Shabatix/ShabbatMainScreen';
import NavBar from './components/NavBar';
import ProfileSettings from './components/Shabatix/ProfileSetting';
import ShareLocationFirst from './components/Shabatix/ShareLocationFirst';
import ShareLocationSecond from './components/Shabatix/ShareLocationSecond';
import ShabbatStatisticsCard from './components/ShabbatStatistics';
import ShareRemindersScreen from './components/ShareRemindersScreen';
import SignupForm from './components/Signup/SignupForm';
import AccountVerification from './components/Signup/emailVerification';
import AccountVerificationPofile from './components/emailVerification';
import EventUserList from './components/EventUserList';
import MealTrainScreen from './components/MealTrain/MealTrainScreen';
import MealTrainDetails from './components/MealTrain/MealTrainDetails';
import MyMealInfo from './components/MealTrain/MyMealInfo';
import MealTrainForm from './components/MealTrainForm';
import MsnagmentUsers from './components/ManegmentUsers/ManagmentUsers';
// i18n Configuration
import JoinAccountPage from './components/Shabatix/JoinAccount';
import Manage from './components/MealTrain/Manage';
import ManageConnectionsScreen from './components/Shabatix/ManageConnectionsScreen';
import MonthlyActiveUsersCard from './components/MonthlyActiveUsersCard';
import Decision from './components/Shabatix/Decision'
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';


// :jigsaw: Context לשיתוף WebSocket
export const SocketContext = createContext<WebSocket | null>(null);

function App() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const wsUrl = process.env.REACT_APP_BACKEND_WS_URL;

  // יוצרים את ה-theme דינמית לפי השפה הנוכחית
  const theme = useMemo(() => {
    const direction = i18n.language === 'he' ? 'rtl' : 'ltr';
    const locale = i18n.language === 'he' ? heIL : enUS;
    return createTheme({ direction }, locale);
  }, [i18n.language]);

  useEffect(() => {
    const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    // const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    // const wsHost = `${wsProtocol}${process.env.REACT_APP_BACKEND_WS_URL}` || `${wsProtocol}${window.location.host}`;
    // console.log("wsHost: ", wsHost);
    // const ws = new WebSocket(wsHost);
    // const ws = new WebSocket('ws://localhost:8080');
    const ws = new WebSocket(process.env.REACT_APP_BACKEND_WS_URL || 'ws://localhost:8080');

    console.log("ws: ", ws);

    ws.onopen = () => {
      console.log('✅ התחברנו ל־WebSocket');
      ws.send('שלום מהקליינט 🎉');
      setSocket(ws);
    };
    ws.onmessage = (event) => {
      console.log(':incoming_envelope: הודעה מהשרת:', event.data);
    };
    ws.onclose = () => {
      console.log(':lock: נותק מהשרת');
      setSocket(null);
    };
    ws.onerror = (error) => {
      console.error(':exclamation: שגיאת WebSocket:', error);
      setSocket(null);
    };
    return () => ws.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <div className="App" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login_page" element={<LoginPage />} />
              <Route path="/register" element={<SignupForm />} />
              <Route path="/AppHome" element={<AppHome />} />
              <Route path="/share/:token" element={<EventShareRouter />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/event/:eventId/menu" element={<MenuDisplay />} />
              <Route path="/menu/:eventId" element={<MenuDisplay />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* ראוטים של שבתון / מיקומים */}
              <Route path="/shareLocationFriends" element={<ShareLocationSecond />} />
              <Route path="/shareLocation" element={<ShareLocationFirst />} />
              <Route path="/shabbat" element={<ShabbatMainScreen />} />
              <Route path="/shabbat-profile" element={<ProfileSettings />} />
              <Route path="/shabbat-profile/shareLocation" element={<ShareLocationFirst />} />
              <Route path="/connections" element={<ManageConnectionsScreen />} />
              <Route path="/desicion" element={<Decision />} />


              <Route path="/meal-train" element={<MealTrainForm />} />
              <Route path="/mealTrain" element={<MealTrainScreen />} />
              <Route path="/meal-trains/:mealTrainId" element={<MealTrainDetails />} />
              <Route path="/meal-trains/:mealTrainId/my-hosting" element={<MyMealInfo />} />
              <Route path="/meal-trains/createMealtrain" element={<MealTrainForm />} />

              <Route path="/invite/:accountId" element={<JoinAccountPage />} />
              <Route path='/shareRemindersScreen/:familyId' element={<ShareRemindersScreen />} />
              <Route path='/verify' element={<AccountVerification />} />
              <Route path='/verify-profile' element={<AccountVerificationPofile />} />
              <Route path="/shabbat-signUp" element={<OnboardingFlow />} />
              <Route path="*" element={<div>404 Not Found</div>} />
              <Route path="/shabbat" element={<ShabbatMainScreen />} />
              {/* <Route path="/events" element={ */}
              <Route path="/shabbat-profile/shareLocation" element={<ShareLocationFirst />} />
              <Route path="/invite/:accountId" element={<JoinAccountPage />} />
              <Route path='/shareRemindersScreen/:familyId' element={<ShareRemindersScreen />} />
              <Route path="/shabbat-signUp" element={<OnboardingFlow />} />
              <Route path="/events" element={
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <EventsList />
                  
                </ThemeProvider>
              } /> 

              {/* נתיבים נוספים */}
              <Route path="/events" element={<EventsList />} />
              <Route path="/Analytics" element={<Analytics />} />
              <Route path='/user_management' element={<MsnagmentUsers />} />'
              <Route path='/bar' element={<MonthlyActiveUsersByApp />} />
              <Route path="/general-statistics" element={<GeneralStatisticsCard />} />
              <Route path="/events-statistics" element={<EventStatisticsCard />} />
              <Route path="/shabbat-statistics" element={<ShabbatStatisticsCard />} />
              <Route path="/meals-statistics" element={<MealsStatisticsCard />} />
              <Route path="/user-events" element={<EventUserList />} />
              {/* <Route path="/my-events" element={<UserEventsList />} /> */}
              {/* <Route path="/graph" element={<AcquisitionChart />} /> */}
              {/* נתיב לגרף רכישה
              <Route path="/graph" element={<AcquisitionChart />} /> {/* נתיב לגרף רכישה */}
              {/* **הוספה: ראוט עבור MonthlyActiveUsersCard אם הוא דף נפרד** */}
              <Route path="/monthly-active-users-card" element={<MonthlyActiveUsersCard />} />
              <Route path="/graph" element={<AcquisitionChart />} />
              <Route path="/meal-trains/:mealTrainId/manage" element={<Manage />} />

              {/* **חובה: ראוט 404 - חייב להיות האחרון ברשימה** */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </Router>
          <ToastContainer position="top-center" autoClose={3000} aria-label="Toast notifications container" />
        </ThemeProvider>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
