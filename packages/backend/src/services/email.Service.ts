//email.Service
// ייבוא של nodemailer – ספרייה לשליחת מיילים
import nodemailer from 'nodemailer';
// ייבוא dotenv – כדי לטעון משתני סביבה מקובץ .env
import dotenv from 'dotenv';
dotenv.config(); // טוען את משתני הסביבה (EMAIL_USER, EMAIL_PASS) לקובץ process.env
// הגדרה של transporter – אובייקט דרכו שולחים מייל
const transporter = nodemailer.createTransport({
  service: 'gmail', // מציין שנשתמש בשירות Gmail
  auth: {
    user: process.env.EMAIL_USER, // כתובת השולח (מה .env)
    pass: process.env.EMAIL_PASS  // סיסמה לאפליקציה (App Password)
  },
  tls: {
    rejectUnauthorized: false // מונע שגיאות של תעודות SSL. מתאים לפיתוח בלבד!
  }
});
// ממשק שמגדיר את מבנה התוצאה שהפונקציה תחזיר
interface SendMailResult {
  success: boolean;     // האם השליחה הצליחה
  error?: Error;        // אם נכשל – תכיל את השגיאה
}

// פונקציה אסינכרונית ששולחת מייל
export async function sendMail(
  to: string,            // כתובת הנמען
  subject: string,       // נושא המייל
  text: string,          // גוף המייל (טקסט פשוט)
  language: 'he' | 'en'='he' // פרמטר חדש לציון השפה
): Promise<SendMailResult> {
  // הגדרת יישור טקסט בהתאם לשפה
  const directionStyle = language === 'he' ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;';
  
  const htmlContent = `<div style="${directionStyle}">${text}</div>`; // תוכן HTML עם יישור

  try {
    // שליחת המייל בפועל דרך Nodemailer
    await transporter.sendMail({
      from: `'מנהל אירועים' <${process.env.EMAIL_USER}>`, // שם השולח + כתובת
      to,      // נמען
      subject, // נושא
      html: htmlContent // גוף ההודעה ב-HTML
    });
    // אם הצליח – הודעה ללוג
    console.log(`${to} המייל נשלח אל`);
    return { success: true }; // מחזיר הצלחה
  } catch (error) {
    // במקרה של שגיאה – הודעה ללוג עם השגיאה
    console.log(`${to} שליחת המייל נכשלה אל`, error);
    return {
      success: false,
      error: error as Error // המרה מפורשת ל-Type Error
    };
  }
}
