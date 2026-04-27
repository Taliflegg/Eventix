import { Request, Response } from "express";
 import {
  getAllDietaryRestrictions,
  createDietaryRestriction,
  updateDietaryRestrictionByName,
  deleteDietaryRestrictionByName
} from "../services/dietaryRestriction.service";

export const dietaryRestrictionController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const restrictions = await getAllDietaryRestrictions();
      res.json(restrictions); // מחזיר [{ id: 1, name: "טבעוני" }, ...]
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dietary restrictions" });
    }
  },

 // POST create
 create: async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const newRestriction = await createDietaryRestriction({ name, description });
    res.json({ success: true, data: newRestriction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
},

// PUT update by name
updateByName: async (req: Request, res: Response) => {
  try {
    const { oldName, newName } = req.body;
    const updated = await updateDietaryRestrictionByName(oldName, newName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
},

  async getAllDietaryRestrictions(req: Request, res: Response) {
  try {
    const restrictions = await getAllDietaryRestrictions();
    res.json(restrictions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch dietary restrictions" });
  }
},

// DELETE by name
deleteByName: async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    await deleteDietaryRestrictionByName(name);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

};
