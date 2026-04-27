import { getRequest } from "./apiServices";

export const getTokenForEvent = async (eventId: string): Promise<string> => {
  const response: any = await getRequest(`share-link/token/${eventId}`)
  const token = await response.token;
  return token;
}