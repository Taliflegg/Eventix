import { Response ,Request} from "express";
import { connectionLocationsService } from "../services/connectionLocations.service";
import { columnMappings, mapKeys } from "../services/column.mapper";

export const connectionLocationsController={

    addConnectionLocation:async (req:Request,res:Response)=>{
        try{
            const {account_a_id,location_a_id,account_b_id,location_b_id}=req.body;
            console.log("req.bode:",req.body);
            if(!account_a_id||!location_a_id||!account_b_id||!location_b_id)
              return res.status(400).json({error:'missing required fields'});

            const conLocMap=mapKeys(req.body,columnMappings.connectionLocationsMapper.toCamel);
            const data=connectionLocationsService.addConnectionLocationsService(conLocMap);
        res.status(201).json({message:'connect location correctly!',data});
        }
        catch(error:any){
        res.status(500).json({error: error.message});
        }   
    }
}