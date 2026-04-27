
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography, IconButton } from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Attendee, Event, User, UserEvent } from '@eventix/shared/src/types';
import { MdDeleteForever } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchAuthenticatedUser } from '../services/usersService';
import eventService from '../services/eventsService';
import { getEventById } from '../services/eventsService';
import { deleteRequest, getRequest } from '../services/apiServices';

import 'tailwindcss/tailwind.css';


type Props = {
    eventId: string;
};

type ShowMenuProps = {
    eventId: string;
    openParticipantsModal?: boolean;
    onCloseParticipantsModal?: () => void;
};



const ShowMenu = ({ eventId, openParticipantsModal = false, onCloseParticipantsModal }: ShowMenuProps) => {
    const { t, i18n }: { t: (key: string) => string; i18n: any } = useTranslation();
    const navigate = useNavigate();
    console.log("eventId שהתקבל:", eventId)
    // const [menuOpen, setMenuOpen] = useState(false);
    const [participantsOpen, setParticipantsOpen] = useState(false);
    // const [menu, setMenu] = useState<any>(null);
    const [participants, setParticipants] = useState<Attendee[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [userEventsInEvent, setUserEventsInEvent] = useState<UserEvent[]>([]);

    // Fetch the current user ID to check if the user is the organizer of the event
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await fetchAuthenticatedUser();
                setCurrentUser(user);
            } catch (err) {
                console.error('Failed to fetch current user', err);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const fetchEvent = async () => {
            try {

                const eventData = await getEventById(eventId, false);
                setEvent(eventData);

            } catch (err: any) {
                if (err.response?.status === 404) {
                    setEvent(null); // אפשר גם לנווט למסך 404 מותאם
                } else {
                    console.error('שגיאה בקריאת האירוע', err);
                }
            }
        };
        fetchEvent();
    }, [eventId]);

    // Open participants modal when openParticipantsModal prop changes
    useEffect(() => {
        if (openParticipantsModal) {
            handleOpen();
        }
    }, [openParticipantsModal]);

    const currentUserId = currentUser?.id;
    const isAdmin = currentUser?.role === 'administrator';
    const isOrganizer = event && currentUserId === event.createdBy;

    const handleClose = () => {
        // setMenuOpen(false);
        setParticipantsOpen(false);
        // setMenu(null);
        setParticipants(null);
        if (onCloseParticipantsModal) {
            onCloseParticipantsModal();
        }
    };

    const handleOpen = async () => {
        setLoading(true);
        setParticipantsOpen(true);
        try {
            const data = await fetchEventAttendees(eventId);
            setParticipants(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    const fetchEventAttendees = async (eventId: string): Promise<Attendee[]> => {
        const response:any =await getRequest(`/events/${eventId}/attendees`);
        return response.data as Attendee[];
    };


    const handleRemove = async (attendeeId: string, attendeeName: string, isSelf: boolean) => {
        const confirmMessage = isSelf
            ? t('ShowMenu.removeU')
            : t('ShowMenu.removeAttendee').replace('{{name}}', attendeeName);

        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) return;

        try {
            await deleteRequest(`/user_events/remove-user?userIdToDelete=${attendeeId}&eventId=${eventId}&userId=${currentUserId}&role=${currentUser?.role}`);
            toast.success(t('ShowMenu.removeSuccess'));
            setParticipants((prev) => prev ? prev.filter((p) => p.id !== attendeeId) : null);
        } catch (error) {
            console.error(error);
            toast.error(t('ShowMenu.removeError'));
        }
    };



    return (
        <Box>
            {/* Fixed Menu Button - Bottom of Screen */}
            <button
                onClick={() => navigate(`/menu/${eventId}`)}
                className={`fixed bottom-4 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 shadow-black/50 ${
                    i18n.language === 'he' ? 'left-4' : 'right-4'
                }`}
            >
                {t('menu')}
            </button>



            <Dialog open={participantsOpen} onClose={handleClose}>
                <DialogTitle>משתתפים עם הגבלות תזונה </DialogTitle>
                <DialogContent>
                    {loading && <Typography>טוען נתונים...</Typography>}

                                        {!loading && participants && currentUser && event && (
                        <Box>
                            {participants.map((p, index) => {
                                const isSelf = p.id === currentUser.id;
                                const participantIsOrganizer = p.id === event.createdBy;

                                const canRemove =
                                    (!isAdmin && !isOrganizer && isSelf) || // רגיל – את עצמו בלבד
                                    (!isAdmin && isOrganizer && !isSelf) || // מארגן – אחרים בלבד
                                    (isAdmin && !participantIsOrganizer);   // אדמין – כולם חוץ ממארגן

                                return (
                                    <Box
                                        key={p.id}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1}
                                    >
                                        <Typography>
                                            {p.name} - {p.dietaryRestrictions?.join(', ') || 'ללא הגבלות'}
                                        </Typography>
                                        {canRemove && (
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemove(p.id, p.name, isSelf)}
                                            >
                                                <MdDeleteForever size={20} />
                                            </IconButton>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                </DialogContent>
            </Dialog>

        </Box>
    );
};
export default ShowMenu;