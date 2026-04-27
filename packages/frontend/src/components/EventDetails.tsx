import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Event } from '@eventix/shared/src';
import EventCard from './EventCard';
import EditEvent from './EditEvent';
import { fetchAuthenticatedUser } from '../services/usersService';
import ShowMenu from './ShowMenu';
import { Square2StackIcon, PhotoIcon, TrashIcon, EllipsisVerticalIcon, UserGroupIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import eventsService, { createEvent } from '../services/eventsService';
import { FaWhatsapp } from "react-icons/fa";
import { getTokenForEvent } from '../services/shareLinkService';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n }: { t: (key: string) => string; i18n: any } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [currentUserId, setCurrentUserId] = useState<string >("");
  const [isDuplicateMode, setIsDuplicateMode] = useState(false); // מצב שכפו
  const [userRole, setUserRole] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);



  const [token, setToken] = useState<string | null>(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isOptionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [isParticipantsModalOpen, setParticipantsModalOpen] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || '1';
  const FaWhatsappIcon = FaWhatsapp as unknown as FC<{ className?: string }>;
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

  // Fetch the current user ID to check if the user is the organizer of the event
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchAuthenticatedUser();
        setCurrentUserId(user?.id);
        setUserRole(user?.role);
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    const loadEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsService.getEventById(id, false);
        setSelectedEvent(data);
        const tokenFromServer = await getTokenForEvent(id);
        console.log("Fetched token:", tokenFromServer);
        setToken(tokenFromServer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading event data');
      } finally {
        setLoading(false);
      }
    };
    loadEventDetails();
  }, [id]);

  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  const BUCKET_NAME = 'event-thumbnails';
  const getImageUrl = (path: string) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
  };

  // שכפול אירוע
  const handleDuplicateEvent = () => {
    if (selectedEvent) {
      const duplicateEvent = {
        ...selectedEvent,
        id: undefined,
      };
      setEditedEvent(duplicateEvent);
      setIsDuplicateMode(true);
      setEditDialogOpen(true);
    } else {
      toast.error(t('EventDetails.duplicate error'), { position: 'top-center', autoClose: 2500 });
    }
  };
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnailFile(e.target.files[0]);
    }
  };

const handleRemoveThumbnail = async () => {
  if (!id) return;

  try {
    const updatedEvent = { ...editedEvent, thumbnail: null }; // הסרת התמונה
    await eventsService.updateEvent(id, updatedEvent); // שליחה לעדכון הנתונים
    setEditedEvent(updatedEvent); // עדכון הקומפוננטה עם התמונה החדשה (ללא תמונה)
    toast.success(t('EventDetails.thumbnail removed'), { position: 'top-center', autoClose: 2500 });
  } catch (error) {
    console.error(error);
    toast.error(t('EventDetails.update error'), { position: 'top-center', autoClose: 2500 });
  }
  window.location.reload();
};


  // עריכה רגילה
  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditedEvent(selectedEvent);
      setIsDuplicateMode(false);
      setEditDialogOpen(true);
    }
  };

  const isOrganizer = selectedEvent?.createdBy === currentUserId || userRole === 'administrator';
  const canDuplicateEvent = true; // אפשר לכולם לשכפל

  console.log('createdBy:', selectedEvent?.createdBy, 'currentUserId:', currentUserId);

  // Handle input changes in the edit dialog
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === 'number'
        ? Number(value)
        : name === 'isLimited'
          ? (e.target as HTMLInputElement).checked
          : value;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // Handle saving changes in the edit dialog
  const handleSaveChanges = async () => {
    if (!id) return;
    if (Object.keys(editedEvent).length === 0 && !thumbnailFile) {
      toast.warn(t('EventDetails.no changes made'), { position: 'top-center', autoClose: 2500 });
      setEditDialogOpen(false);
      return;
    }
    try {
      const formData = new FormData();
      // הוספת שדות האירוע ל-FormData
      Object.entries(editedEvent).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      // הוספת קובץ התמונה אם קיים
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      await eventsService.updateEventWithImage(id, formData);
      setEditDialogOpen(false);
      toast.success(t('EventDetails.update success'), { position: 'top-center', autoClose: 2500 });
    } catch (error) {
      console.error(error);
      toast.error(t('EventDetails.update error'), { position: 'top-center', autoClose: 2500 });
    }
    window.location.reload();
  };

  // Handle creating a new event in the edit dialog
  // const handleCreateNewEvent = async (eventData: Partial<Event>) => {
  //   try {
  //     const res = await fetch(`${frontendUrl}/api/events`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(eventData),
  //     });
  //     if (!res.ok) throw new Error('Failed to create event');
  //     const newEvent = await res.json();
  //     const eventId = newEvent.data?.id || newEvent.id;
  //     console.log('New event created:', newEvent);
  //     toast.success(t('EventDetails.duplicate success'), { position: 'top-center', autoClose: 2500 });
  //     setEditDialogOpen(false);
  //     navigate(`/event/${eventId}`);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(t('EventDetails.duplicate error'), { position: 'top-center', autoClose: 2500 });
  //   }
  // };
  const handleCreateNewEvent = async (eventData: Partial<Event>) => {
    try {
      const newEvent = await createEvent(eventData); // קריאה לפונקציה בסרוויס
      const eventId = newEvent.id;
  
      console.log('New event created:', newEvent);
      toast.success(t('EventDetails.duplicate success'), { position: 'top-center', autoClose: 2500 });
      setEditDialogOpen(false);
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error(error);
      toast.error(t('EventDetails.duplicate error'), { position: 'top-center', autoClose: 2500 });
    }
  };
  
  const BASE_URL = `${frontendUrl}/share`;
  const fullUrl = `${BASE_URL}/${token}`;
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("שגיאה בהעתקה", err);
    }
  };

  const message = `היי! ראיתי אירוע שיכול לעניין אותך 🎉\n\n${fullUrl}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

  // Image handling functions
  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  const handleRemoveImage = async () => {
    if (!selectedEvent || !id) return;
    
    try {
      const updatedEvent = { ...selectedEvent, thumbnail: '' };
      await eventsService.updateEvent(id, updatedEvent);
      setSelectedEvent(updatedEvent);
      setImageModalOpen(false);
      toast.success('התמונה הוסרה בהצלחה', { position: 'top-center', autoClose: 2500 });
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בהסרת התמונה', { position: 'top-center', autoClose: 2500 });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEvent || !id) return;

    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      // כאן צריך להוסיף קריאה לשרת להעלאת התמונה
      // כרגע נשתמש ב-URL זמני לצורך הדגמה
      const imageUrl = URL.createObjectURL(file);
      const updatedEvent = { ...selectedEvent, thumbnail: imageUrl };
      await eventsService.updateEvent(id, updatedEvent);
      setSelectedEvent(updatedEvent);
      setImageModalOpen(false);
      toast.success('התמונה הועלתה בהצלחה', { position: 'top-center', autoClose: 2500 });
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בהעלאת התמונה', { position: 'top-center', autoClose: 2500 });
    }
  };

  const handleOptionsMenuClick = () => {
    setOptionsMenuOpen(!isOptionsMenuOpen);
  };

  const handleDuplicateFromMenu = () => {
    setOptionsMenuOpen(false);
    handleDuplicateEvent();
  };

  const handleCopyLinkFromMenu = () => {
    setOptionsMenuOpen(false);
    handleShare();
  };

  const handleParticipantsFromMenu = async () => {
    setOptionsMenuOpen(false);
    setParticipantsModalOpen(true);
  };



  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOptionsMenuOpen && !target.closest('.options-menu')) {
        setOptionsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionsMenuOpen]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10 text-gray-900">
        <div className="flex flex-col justify-center items-center h-40 gap-2">
          <div className="flex space-x-2">
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
          <span className="text-gray-500 text-sm">{t('EventDetails.loading details')}...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10 text-gray-900">
        <div className="p-6 text-red-600 text-center">{error}</div>
      </main>
    );
  }

  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div>
        {loading && <p >{t('EventDetails.loading details')}...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
         {selectedEvent && (
          <h1 className="text-3xl font-bold text-gray-800 mb-12 mt-16">
            {selectedEvent.title}
          </h1>
        )}
          {selectedEvent && <EventCard event={selectedEvent}  currentUserId={currentUserId}/>}
     
       
        

      </div>

      {/* Event Details Card
      {selectedEvent && (
        <div className="bg-transparent p-6 mb-8">
          <div className="bg-transparent p-4">
            <EventCard event={selectedEvent} />
          </div>
        </div>
      )} */}

      {/* Menu Section */}
      <ShowMenu 
        eventId={id !== undefined ? id : "123"} 
        openParticipantsModal={isParticipantsModalOpen}
        onCloseParticipantsModal={() => setParticipantsModalOpen(false)}
      />



      {/* WhatsApp Share Button - Fixed Position */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        title="שתף בוואטסאפ"
        className={`fixed top-40 z-50 p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200 ${
          i18n.language === 'he' ? 'right-4' : 'left-4'
        }`}
      >
        <FaWhatsappIcon className="h-5 w-5" />
      </a>

      {/* Image Button - Fixed Position */}
      <button
        onClick={handleImageClick}
        title={selectedEvent?.thumbnail ? "צפה בתמונה" : "הוסף תמונה"}
        className={`fixed top-40 z-50 p-3 bg-black hover:bg-gray-800 text-green-500 rounded-full shadow-lg transition-all duration-200 ${
          i18n.language === 'he' ? 'right-20' : 'left-20'
        }`}
      >
        <PhotoIcon className="h-5 w-5" />
      </button>

      {/* Three Dots Button - Fixed Position */}
      <button
        onClick={handleOptionsMenuClick}
        title="אפשרויות נוספות"
        className={`options-menu fixed top-40 z-50 px-4 py-3 bg-transparent hover:bg-gray-100 text-black rounded-full transition-all duration-200 ${
          i18n.language === 'he' ? 'right-36' : 'left-36'
        }`}
      >
        <EllipsisVerticalIcon className="h-6 w-6" />
      </button>

      {/* Back to Events Button - Fixed Position */}
      <button
        onClick={() => navigate(`/user-events?page=${page}`)}
        className={`fixed bottom-4 z-50 px-4 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 shadow-black/50 flex items-center gap-2 ${
          i18n.language === 'he' ? 'right-4' : 'left-4'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={i18n.language === 'he' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
        <span className="text-sm font-medium">{t('EventDetails.back to events')}</span>
      </button>

      {/* Options Menu */}
      {isOptionsMenuOpen && (
        <div className={`options-menu fixed top-52 z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-48 ${
          i18n.language === 'he' ? 'right-36' : 'left-36'
        }`}>
          <div className="py-2">
            <button
              onClick={handleDuplicateFromMenu}
              className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center justify-between transition-colors duration-150"
            >
              <Square2StackIcon className="h-5 w-5 text-black" />
              <span className="text-gray-700">{t('EventDetails.duplicate event')}</span>
            </button>
            
            <button
              onClick={handleCopyLinkFromMenu}
              className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center justify-between transition-colors duration-150"
            >
              <LinkIcon className="h-5 w-5 text-black" />
              <span className="text-gray-700">{t('EventDetails.copy link')}</span>
            </button>
            
            <button
              onClick={handleParticipantsFromMenu}
              className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center justify-between transition-colors duration-150"
            >
              <UserGroupIcon className="h-5 w-5 text-black" />
              <span className="text-gray-700">{t('EventDetails.participants')}</span>
            </button>
            
            {isOrganizer && (
              <button
                onClick={handleEditEvent}
                className="w-full px-4 py-3 text-right hover:bg-gray-50 flex items-center justify-between transition-colors duration-150"
              >
                <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-gray-700">{t('EventDetails.edit event')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Copy Notification */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          הקישור הועתק בהצלחה!
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedEvent?.thumbnail ? "תמונת האירוע" : "הוסף תמונה לאירוע"}
              </h3>
              <button
                onClick={() => setImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedEvent?.thumbnail ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={getImageUrl(selectedEvent.thumbnail)}
                    alt={selectedEvent.title}
                    className="max-w-full h-64 object-cover rounded-xl shadow-md"
                  />
                </div>
                {isOrganizer && (
                  <button
                    onClick={handleRemoveImage}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    הסר תמונה
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">אין תמונה לאירוע זה</p>
                  {isOrganizer && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        בחר תמונה
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Edit Dialog */}
      {selectedEvent && (
        <EditEvent
          open={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveChanges}
          onCreateNewEvent={handleCreateNewEvent}
          editedEvent={editedEvent}
          originalEvent={selectedEvent}
          onThumbnailChange={handleThumbnailChange}
          onChange={handleInputChange}

          isDuplicate={isDuplicateMode} // ← זה מה שמסתיר את כפתור השמירה במצב שכפול
          onRemoveThumbnail={handleRemoveThumbnail}
        />
      )}
    </main>
  );
};

export default EventDetails;