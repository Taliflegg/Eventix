import {connectionLocations} from '@eventix/shared/src';
import { supabase } from './database.service';
import { columnMappings, mapKeys } from './column.mapper';

export const connectionLocationsService={
   
    // addConnectionLocationsService:async(conLoc:connectionLocations)=>{
    //     const mapConnectionLocation=mapKeys(conLoc,columnMappings.connectionLocationsMapper.toSnake);
    //     const{data,error}= await supabase
    //     .from('location_connections')
    //     .insert([mapConnectionLocation]);
    //     if(error)
    //         throw new Error(error.message);
    //     return data;
    // }
    addConnectionLocationsService: async (conLoc: connectionLocations) => {
  const connectionWithDate = {
    ...conLoc,
    createdAt: new Date().toISOString(), // מוסיפים את התאריך הנוכחי כאן
  };

  const mapConnectionLocation = mapKeys(
    connectionWithDate,
    columnMappings.connectionLocationsMapper.toSnake
  );

  const { data, error } = await supabase
    .from('location_connections')
    .insert([mapConnectionLocation]);

  if (error) throw new Error(error.message);
  return data;
}

}

