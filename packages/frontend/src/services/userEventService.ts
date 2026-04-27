import { UserEventsResponse } from "@eventix/shared";
import { getRequest } from "./apiServices";

export const fetchIsUserExistsInEvent = async (userId: string, eventid: string): Promise<boolean> => {
    try {
        const response = await getRequest<UserEventsResponse>(`user_events/${userId}`);
        if (!response || !response.data)
            return false;
        response.data.map((userEvent) => {
            if (userEvent.eventId === eventid) {
                return true;
            }
        })
        return false;
    } catch (error) {
        console.error("error in fetch IsUserExistInEvent", error);
        return false;
    }
};