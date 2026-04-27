import express, { Router } from 'express';
import { MealTrainController } from '../controllers/meal_train.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import multer from 'multer';
const router = express.Router();
const upload=multer({dest:'uploads/'})
router.post('/',authMiddleware,
      upload.single('Image'),
       MealTrainController.createMealTrainController);
router.get('/with-volunteers', authMiddleware, MealTrainController.getWithVolunteers);//////////////////
router.get('/',authMiddleware, MealTrainController.getMealTrains);
router.get('/:id', MealTrainController.getMealTrainByIdOne);
router.get('/:mealTrainId/dates', MealTrainController.getMealTrainDatesOne);
router.put('/:id', MealTrainController.addMealTrainDateControllerOne);
// router.post('/send-admin-reminder',MealTrainController.sendAdminReminder);
// router.post('/send-participant-reminder', MealTrainController.sendParticipantReminder);/Q
router.get('/:mealTrainId/dates', MealTrainController.getMealTrainDates);
router.post('/', MealTrainController.createMealTrainController);
router.get('/my/:mealTrainId', authMiddleware, MealTrainController.getMyMealTrainById);
router.get('/:mealTrainId', authMiddleware, MealTrainController.getMealTrainById);
router.post('/send-emails/:mealTrainId', MealTrainController.sendMailToVolunteers);

//Tsivya
router.get('/dates/:mealTrainId', MealTrainController.getAllMealTrainDates);
router.put('/meal-trains/:id', MealTrainController.updateMealTrain);
router.get('/meal-trains/:mealTrainId', MealTrainController.loadMealTrainByMyId);
// router.get('/meal-train-dates', MealTrainController.getAllMealTrainDates);
router.get('/meal-train-dates/volunteers/:meal_train_id', MealTrainController.getVolunteerCountByMealTrainId);
router.post('/meal-train-dates/volunteer/:meal_train_date_id', MealTrainController.volunteerForDate);
router.get('/meal-train-dates/volunteer-users/:meal_train_id', MealTrainController.getVolunteerUserIds);
router.get('/users/email/:user_id', MealTrainController.getVolunteerEmailById);
router.put('/meal-train-dates/reminder/:meal_train_date_id', MealTrainController.updateReminderDays);
router.post('/meal-trains/:meal_train_id/dates/:meal_train_date_id/volunteer',authMiddleware,MealTrainController.volunteerForMeal);
//router.post('/meal-train-dates/send-update/:meal_train_id', MealTrainController.sendUpdateToVolunteers);
//router.post('/meal-trains/:meal_train_id/update', MealTrainController.sendUpdateToVolunteers);
router.post('/meal-trains/send-update/:meal_train_id', MealTrainController.sendUpdateToVolunteers);
export default router;