//events.router.ts
import { Router } from 'express';
import { eventsController } from '../controllers/events.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createClient } from '@supabase/supabase-js';


// const router = Router();
import multer from 'multer'
const router: Router = Router();
const upload=multer({dest:'uploads/'})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
router.get('/user-events',authMiddleware,eventsController.getUserEventsWithFilter);
router.get('/', eventsController.getAllEvents);

//אנליטיקות
router.get('/events-created-this-month', eventsController.getEventsCreatedThisMonthController);
router.get("/users-with-many-events",eventsController.getUsersWithMoreThanTwoEventsCount);
router.get('/stats/monthly-event-creation', eventsController.getMonthlyEventStats);



//  מחזיר את רשימת האירועים שהסתיימו
router.get('/completed', eventsController.getCompletedEvents);
router.get('/preview/:id', eventsController.previewEventHtml);

// router.get('/:id', eventsController.getEventById);
//מי שעשתה את הניתוב הזה- עשית נוסף בלי אימות משתמש בשביל בדיקה בפוסטמן?
// router.get('/:id', eventsController.getEventById);
router.get('/:id',authMiddleware, eventsController.getEventById);
router.get('/:eventId/attendees', eventsController.getEventAttendees);

router.get('/:eventId/attendees', eventsController.getEventAttendees);

// router.get("/dashboard", authMiddleware, (req, res) => {
//   res.json({ message: `Hello ${req.params?.email}` });
// });

//יצירת אירוע חדש
router.post(
  '/',
  authMiddleware,                // בודק שהמשתמש מחובר (ומצרף את ה־user ל־req)
  upload.single('thumbnail'),    // מקבל קובץ תמונה בשם 'thumbnail' ושם אותו ב־req.file
  eventsController.createEvent   // הפונקציה שכתבת שמטפלת בלוגיקה של ההעלאה והשמירה
);
// עדכון אירוע (רק למשתמש מחובר)
router.put('/:id', authMiddleware,upload.single('thumbnail'), eventsController.updateEvent);
// מחיקת אירוע (רק למשתמש מחובר)
router.delete('/:id', authMiddleware, eventsController.deleteEvent);
router.post('/', eventsController.createEvent);
// router.get('/user-events', authMiddleware, eventsController.getUserEventsWithFilter)

//מקבל את כמות המשתתפים לאירוע והדרישות שלהם
router.get('/getParticipantOfEvent/:id', eventsController.getParticipantOfEvent);


router.put('/:id', eventsController.updateEvent);
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.params?.email}` });
});
router.post('/JoiningTheEvent', authMiddleware , eventsController.joinEvent);



export default router;
