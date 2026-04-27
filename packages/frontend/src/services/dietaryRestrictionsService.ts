import { DietaryRestriction } from '@eventix/shared';
import { getRequest, postRequest, putRequest, deleteRequest } from './apiServices';



export async function getAllDietaryRestrictions(): Promise<DietaryRestriction[]> {
  return await getRequest<DietaryRestriction[]>('/dietary-restrictions/all');
}

export async function createDietaryRestriction(restriction: Omit<DietaryRestriction, 'id'>) {
  return postRequest('/dietary-restrictions', restriction);
}

export async function updateDietaryRestrictionByName(oldName: string, newName: string) {
  return putRequest(`/dietary-restrictions/${encodeURIComponent(oldName)}`, { newName });
}

export async function deleteDietaryRestrictionByName(name: string) {
  return deleteRequest(`/dietary-restrictions/${encodeURIComponent(name)}`);
}