import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEventByToken } from "../../services/eventsService";
import EventPreview from './EventPreview';
import EventExpired from "./EventExpired";
import EventShareView from "./EventShareView";
import {EventDetailsView} from '@eventix/shared'
import MealEventView from './EventFullView'



const EventShareRouter: React.FC = () => {
    const [event, setEvent] = useState<EventDetailsView | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const { token = '' } = useParams<{ token?: string }>();
    console.log(token);
    
    useEffect(() => {
      if (!token) {
        setIsExpired(true);
        return;
      }
      fetchEventByToken(token)
      .then((res) => {
        setEvent(res.event);
        setIsAuthenticated(res.isAuthenticated);
      })
      .catch((err) => {
        console.warn("error:", err.message);
        setIsExpired(true);
      });
  }, [token]) ;

  if (isExpired) return <EventExpired />;
  if (!event) return <div>טוען את פרטי האירוע...</div>;

  return (
    <div>
      <EventShareView event={event} token={token}/>
      {isAuthenticated ? (
        <MealEventView />
      ) : (
        <EventPreview />
      )}
    </div>
  );
};
export default EventShareRouter;






