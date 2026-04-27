
import { Request, Response } from 'express';
import { getMealTrainDatesByTrainId, getMealTrainWithVolunteers, getMealTrainsForUser, sendAdminReminder, sendParticipantsRemindersByPreference, loadMealTrainById, getMealTrainDate, createMealTrain, sendMailToVolunteers, getMealTrainDatesByMealTrainId, updateMealTrain, getVolunteerCountByMealTrainId, volunteerForDate, getVolunteerUserIds, mailByIdVolunteer, updateReminderDays, volunteerForMeal, getVolunteerEmails, getMealTrainById } from '../services/meal_trains.service';
import { MealTrainResponse } from '@eventix/shared';
import fs from 'fs'
import { supabase } from '../services/database.service';
import { JwtPayload } from '@supabase/supabase-js';
import { sendMail } from '../services/email.Service';
import { addMealTrainDateServiceOne, getMealTrainByIdOne, getMealTrainDatesByTrainIdOne } from '../services/meal_train.service';

export const MealTrainController = {

getMealTrainByIdOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const mealTrain = await getMealTrainByIdOne(id);
      res.json(mealTrain);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
  , getMealTrainDatesOne: async (req: Request, res: Response) => {
    try {
      const { mealTrainId } = req.params;
      const dates = await getMealTrainDatesByTrainIdOne(mealTrainId);
      // מחזירים רק את מערך התאריכים ללקוח
      console.log('dates:', dates);
      res.json(dates);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
  ,
  addMealTrainDateControllerOne: async (req: Request, res: Response) => {
    try {
      console.log('📥 Controller got request');
      const { id } = req.params;
      console.log('📥 Meal Train Date ID:', id);
      const { date, volunteer_name, meal_description, reminder_days, notes, volunteer_user_id, meal_train_id } = req.body;

      await addMealTrainDateServiceOne(id, { date, volunteer_name, meal_description, reminder_days, notes, volunteer_user_id, meal_train_id });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in controller:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
  ,

  getMealTrains:async(req: Request, res: Response)=> {
  try {
    const userId = (req as any).user.userId;
     const userRole= (req as any).user.role;
    const mealTrains = await getMealTrainsForUser(userId, userRole);
    res.json(mealTrains);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
},


  getMealTrainById: async (req: Request, res: Response) => {
    try {
      // מהאימות
      const mealTrainId = req.params.mealTrainId;
      const mealTrain = await getMealTrainById(mealTrainId);
      if (!mealTrain) {
        return res.status(404).json({ message: ' mealTrain not found' });
      }
      res.json(mealTrain);
    }
    catch
    (error) {
      console.error(error); res.status(500).json({ message: 'Server error' });
    }
  },
  getMyMealTrainById: async (req: Request, res: Response) => {
    try {
      // מהאימות
      const mealTrainId = req.params.mealTrainId;
      const userId = (req as any).user.userId;
      const mealTrain = await getMealTrainDate(userId, mealTrainId);
      if (!mealTrain) {
        return res.status(404).json({ message: ' mealTrain not found' });
      }
      res.json(mealTrain);
    }
    catch
    (error) {
      console.error(error); res.status(500).json({ message: 'Server error' });
    }
  }
  ,
  sendMailToVolunteers: async (req: Request, res: Response) => {
    try {
      const mealTrainId = req.params.mealTrainId;
      await sendMailToVolunteers(mealTrainId);
      res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
      console.error("error", error);
      res.status(500).json({ message: 'Server error' });
    }
  },
 
  createMealTrainController: async (req: Request, res: Response<MealTrainResponse>) => {
    try {
      const {
        name,
        address,
        startDate,
        endDate,
        adults,
        childrens,
        dietaryInfo,
        deliveryTime,
        adminUserId,
        shareToken,
        createdAt,
        Image
      } = req.body;

      // בדיקה בסיסית של קלט
      if (!name || !address || !startDate || !endDate || !adminUserId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          data: null as any,
        });;
      }


      const mealTrain = await createMealTrain({
        name,
        address,
        startDate,
        endDate,
        adults,
        childrens,
        dietaryInfo,
        deliveryTime,
        adminUserId,
        shareToken,
        createdAt,
        Image
      });

      return res.status(201).json({
        success: true,
        data: mealTrain,
      });
    } catch (error: any) {
      console.error('Error creating meal train:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        data: null as any,
      });
    }
  },


  getWithVolunteers: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        return res.status(401).json({ error: 'Missing token' });
      }

      const count = await getMealTrainWithVolunteers();
      res.status(200).json({ count });

    } catch (error: any) {
      console.error('Error fetching meal train data:', error);
      res.status(500).json({ error: 'Failed to fetch meal train data' });
    }
  },
  async getMealTrainDates(req: Request, res: Response) {
    try {
      const { mealTrainId } = req.params;
      const dates = await getMealTrainDatesByTrainId(mealTrainId);
      res.json(dates); // מחזירים את המערך של האובייקטים
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
  //Tsivya
  getAllMealTrainDates: async (req: Request, res: Response) => {
    console.log('IDdddddddd');
    try {
      console.log('IDdddddddd');
      const { mealTrainId } = req.params;
      console.log('ID', mealTrainId);
      const mealTrainDates = await getMealTrainDatesByMealTrainId(mealTrainId);
      console.log("Meal Train Dates:", mealTrainDates);
      res.json({ success: true, data: mealTrainDates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  updateMealTrain: async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    console.log("Updating Meal Train with ID:", id, "Updates:", updates);
    try {
      const updatedMealTrain = await updateMealTrain(id, updates);
      res.json({ success: true, data: updatedMealTrain });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getVolunteerCountByMealTrainId: async (req: Request, res: Response) => {
    const { meal_train_id } = req.params;
    try {
      const { total, count } = await getVolunteerCountByMealTrainId(meal_train_id);
      res.json({ success: true, total, count });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  volunteerForDate: async (req: Request, res: Response) => {
    const { meal_train_date_id } = req.params;
    const { userId, userName, mealDescription, notes } = req.body;
    console.log(`meal_train_id: ${meal_train_date_id} userId: ${userId} userName: ${userName} notes:${notes} mealDescription: ${mealDescription}`)
    try {
      const updatedMealTrainDate = await volunteerForDate(meal_train_date_id, userId, userName, notes, mealDescription);
      res.json({ success: true, data: updatedMealTrainDate });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getVolunteerUserIds: async (req: Request, res: Response) => {
    const { meal_train_id } = req.params;
    try {
      const userIds = await getVolunteerUserIds(meal_train_id);
      res.json({ success: true, data: userIds });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getVolunteerEmailById: async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
      const email = await mailByIdVolunteer(user_id);
      res.json({ success: true, email });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  updateReminderDays: async (req: Request, res: Response) => {
    const { meal_train_date_id } = req.params;
    const { days } = req.body;
    try {
      const updated = await updateReminderDays(meal_train_date_id, days);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  volunteerForMeal: async (req: Request, res: Response) => {
    const { meal_train_id, meal_train_date_id } = req.params;
    const userId = (req as any).user?.userId; // Auth middleware needed
    const { name } = req.body;

    try {
      const updatedDate = await volunteerForMeal(meal_train_id, meal_train_date_id, { name, userId });

      if (!updatedDate) {
        return res.status(404).json({ success: false, message: 'Date introuvable' });
      }

      res.json({ success: true, data: updatedDate });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  sendUpdateToVolunteers: async (req: Request, res: Response) => {
    const { meal_train_id } = req.params;
    const { message } = req.body;

    try {
      console.log("meal_train_id:", meal_train_id);
      console.log("message:", message);

      const emails = await getVolunteerEmails(meal_train_id);
      console.log("Volunteers emails:", emails);
      for (const email of emails) {
        await sendMail(email, 'עדכון ארוחה ', message);
      }
      res.json({ success: true, message: 'Updates sent to volunteers.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  loadMealTrainByMyId: async (req: Request, res: Response) => {
    console.log('req.params: ', req.params)
    const { mealTrainId } = req.params;
    console.log("Fetching Meal Train by ID:", mealTrainId);
    try {
      const mealTrain = await loadMealTrainById(mealTrainId);
      console.log("Meal Train Data:", mealTrain);
      res.json({ success: true, data: mealTrain });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
}