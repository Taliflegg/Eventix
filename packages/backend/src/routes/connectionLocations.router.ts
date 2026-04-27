import { Router } from "express";
import { connectionLocationsController } from "../controllers/connectionLocations.controller";

const router=Router();
router.post('/',connectionLocationsController.addConnectionLocation);

export default router;