//EmailController
import { Request,Response } from "express";
import { sendMail } from "../services/email.Service"
import { lang } from "moment";

export const EmailController={

sendMail:async(req:Request,res:Response)=>{
  console.log("Received email request:", req.body);
  
    const {to,subject,text,lang}=req.body
   console.log("Email details:", {to, subject, text});
  const result = await sendMail(to, subject, text,lang); // Default to 'en' if no language is provided
  if (result.success) {
    res.status(200).json({ message: 'מייל נשלח בהצלחה' });
  } else {
    res.status(500).json({ error: 'שליחת המייל נכשלה' });
  }
}

}