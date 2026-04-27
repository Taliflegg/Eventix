//index.ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';


import { setupReminderCronJob,setupMealTrainReminderCronJob } from './cron-jobs/reminder.cron';
import { authMiddleware } from './middlewares/authMiddleware';
import { default as accountRouter, default as accountsRouter } from './routes/accounts.router';
import analyticsRoutes from './routes/analytics.router';
import authRoutes from './routes/auth.router';
import connecctionLocationsRouter from './routes/connectionLocations.router';
import dietaryRestrictionRoutes from './routes/dietaryRestriction.routes';
import emailRoutes from './routes/email.router';
import eventsRoutes from './routes/events.router';
import healthRoutes from './routes/health';
import userEventsRoutes from './routes/user_event.router';
import menuActionsRoutes from './routes/menuActions.router';
import notificationRoutes from './routes/notification.routes';
import connectionLocationsRouter from './routes/connectionLocations.router';

import analystRoter from './routes/analyst.router';
import menuActionRoutes from './routes/menuActions.router';
import notificationroutes from './routes/notification.routes';
import onboardingRoutes from './routes/onboarding.routes';
import shabbatRoutes from './routes/shabbat.router';
import shareLinkRoutes from './routes/share-link.routes';
import userActivityRoutes from './routes/user_activity.router';
import user_eventsRoutes from './routes/user_event.router';
import usersRoutes from './routes/users.router';
import './services/socket.service';
import statisticsRoutes from './routes/analytics.router'

// הגדרת משתנים
// import statisticsRoutes from './routes/statistics.router';
import mealTrainRouter from './routes/meal_train.router';

dotenv.config();
setupReminderCronJob();



// ✅ Middleware

dotenv.config();
setupReminderCronJob();
const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
console.log("🧪 JWT_SECRET מתוך index.ts:", process.env.JWT_SECRET);

// ✅ Middleware (הגדרות לפי סדר חשוב!)
setupMealTrainReminderCronJob();
// :white_check_mark: Middleware (הגדרות לפי סדר חשוב!)
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());

app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use('/api/meal_train', mealTrainRouter);

// Routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dietary-restrictions', dietaryRestrictionRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/user-activity', userActivityRoutes);
app.use('/api/notification', notificationroutes);
app.use('/api', analystRoter);
app.use('/api/analytics',analyticsRoutes);
app.use('/api/menu-actions',authMiddleware, menuActionRoutes);
// app.use('/api/statistics',authMiddleware, statisticsRoutes);
app.use('/api/meal_train', mealTrainRouter);
app.use('/api/user_events', userEventsRoutes);
app.use('/api/statistics',authMiddleware, statisticsRoutes);


//app.use('/api/statistics', statisticsRoutes);
app.use('/api/meal_train', mealTrainRouter);////////////
app.use('/api/user_events', user_eventsRoutes);
app.use('/api/email', emailRoutes);
app.use(authRoutes);
app.use('/api/accounts', accountRouter);
app.use('/api/user-activity', userActivityRoutes);
app.use('/api/notification', notificationroutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // הצגת קבצים סטטיים
console.log(":jigsaw: Users route loaded");
// Routes
console.log(":jigsaw: Users route loaded"); // ← אחרי app.use('/api/users', ...)
// Routes
app.use('/api/share-link', shareLinkRoutes);
app.use('/api/menu-actions',authMiddleware, menuActionRoutes);
app.use('/api/shabbat', shabbatRoutes);
app.use('/api/locations', accountsRouter);
app.use('/api/connectionLocations', connectionLocationsRouter);

// קבצים סטטיים
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


app.use('/api/locations',accountsRouter);
app.use('/api/connectionLocations',connecctionLocationsRouter);

// ✅ Logs
console.log(':jigsaw: Users route loaded');
console.log('🧩 Users route loaded');

// Start server
app.listen(PORT, () => {
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log(`:rocket: Server running on port ${PORT}`);
  console.log(`:memo: Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`:globe_with_meridians: CORS enabled for: ${CORS_ORIGIN}`);
});





