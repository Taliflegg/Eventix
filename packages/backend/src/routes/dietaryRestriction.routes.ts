import express from "express";
import { dietaryRestrictionController } from "../controllers/dietaryRestricition.controller";

const router = express.Router();


// GET all dietary restrictions
router.get("/", dietaryRestrictionController.getAll);

router.get("/all", dietaryRestrictionController.getAllDietaryRestrictions);


// POST new dietary restriction
router.post("/add", dietaryRestrictionController.create);

// PUT update dietary restriction by name
router.put("/update", dietaryRestrictionController.updateByName);

// DELETE dietary restriction by name
router.delete("/delete", dietaryRestrictionController.deleteByName);


export default router;
