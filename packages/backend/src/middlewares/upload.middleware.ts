import multer from 'multer';

// נשתמש בזיכרון במקום בדיסק
const storage = multer.memoryStorage();

export const upload = multer({ storage });
