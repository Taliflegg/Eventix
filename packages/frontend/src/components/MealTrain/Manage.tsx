import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaFacebook, FaEnvelope } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import {MealTrainService} from '../../services/mealTrainService';
import { MealTrainDates, MealTrains, User } from '@eventix/shared';
import { fetchAuthenticatedUser } from '../../services/usersService';
import { Square2StackIcon } from '@heroicons/react/24/outline';
import i18n from '../../i18n/i18n';
import { formatDateRange } from './DateManage'; // adapte le chemin si besoin
import { toast } from 'react-toastify';


const Modal = React.memo(({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
        <div
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
));





const Manage = () => {
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const { mealTrainId } = useParams<{ mealTrainId: string }>(); // ← récupère l’id depuis l’URL
    const [mealTrainInfo, setMealTrainInfo] = useState<MealTrains | null>(null);
    const showSuccessToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };
    const [volunteerName, setVolunteerName] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [mealDescription, setMealDescription] = useState('');
    // const [selectedReminderDays, setSelectedReminderDays] = useState(2);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [mealTrainDates, setMealTrainDates] = useState<MealTrainDates[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [meals, setMeals] = useState<MealTrainDates[]>([]);
    const [myVolunteerDateId, setMyVolunteerDateId] = useState<string | null>(null);
    // const BASE_URL = 'http://localhost:3000/shareRemindersScreen';
    const BASE_URL = process.env.REACT_APP_FRONTEND_URL;
    const fullUrl = `${BASE_URL}/shareRemindersScreen/${mealTrainId}`;
    const [copied, setCopied] = useState(false);
    //קשור לכפתור התנדב
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
    //const [dishDescription, setDishDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [reminderDays, setReminderDays] = useState<number>(1);


    const language = i18n.language;

    // const showSuccessToast = (message: string) => {
    //     toast.custom((t) => (
    //         <div
    //             className={`${t.visible ? 'animate-enter' : 'animate-leave'
    //                 } max-w-md w-full bg-blue-100 border border-blue-300 text-blue-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}
    //         >
    //             <div className="flex-1 w-0">
    //                 <p className="text-sm font-semibold">{message}</p>
    //             </div>
    //             <div className="ml-4 flex-shrink-0 flex">
    //                 <button
    //                     onClick={() => toast.dismiss(t.id)}
    //                     className="text-blue-700 hover:text-blue-900"
    //                 >
    //                     ✖
    //                 </button>
    //             </div>
    //         </div>
    //     ));
    // };

    const closeVolunteerModal = () => {
        setIsModalOpen(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('שגיאה בהעתקה', error);
        }
    };

    // //fonction pour recuperer la date ou je suis volontaire
    // useEffect(() => {
    //     const fetchMyVolunteerDate = async () => {
    //         if (!user) return;
    //         const volunteerDate = await getMealTrainDate(user.id, mealTrainId);
    //         if (volunteerDate) {
    //             setMyVolunteerDateId(volunteerDate.id);
    //         }
    //     };
    //     fetchMyVolunteerDate();
    // }, [user, mealTrainId]);

    // //fonction pour gerer l inscription 
    // const handleVolunteer = async (dateId: string, name: string) => {
    //     try {
    //         const updatedDate = await volunteerForMeal(mealTrainId, dateId, { name });

    //         // Mettre à jour les repas
    //         setMeals((prev) =>
    //             prev.map((d) => (d.id === dateId ? updatedDate : d))
    //         );

    //         // Marquer que c'est moi qui me suis inscrit
    //         setMyVolunteerDateId(dateId);
    //     } catch (error) {
    //         console.error("Erreur d'inscription :", error);
    //     }
    // };




    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await fetchAuthenticatedUser();
            setUser(currentUser);
        };
        fetchUser();
    }, []);

    //תצוגת כל התאריכים
    useEffect(() => {
        const fetchDates = async () => {
            console.log(mealTrainId);
            if (!mealTrainId) return; // évite l'appel si undefined

            try {
                const dates = await MealTrainService.getMealTrainDate(mealTrainId); // récupéré via useParams()
                console.log("Dates récupérées:", dates);
                setMealTrainDates(dates); // ou setMealTrainDates
            } catch (error) {
                console.error('Erreur lors du chargement des dates', error);
            }
        };

        fetchDates();
    }, [mealTrainId]);


    useEffect(() => {
        const fetchData = async () => {
            if (!mealTrainId) return;
            try {
                const data = await MealTrainService.getMealTrainById(mealTrainId);
                console.log("Données reçues de getMealTrainById :", data);

                setMealTrainInfo({
                    id: data.id,
                    name: data.name,
                    address: data.address,
                    adults: data.adults,
                    childrens: data.childrens,
                    dietaryInfo: data.dietaryInfo,
                    deliveryTime: data.deliveryTime,
                    adminUserId: data.adminUserId,
                    shareToken: data.shareToken,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                      Image: data.Image ?? "", // הוסיפי
                });
            } catch (error) {
                console.error("Erreur lors de la récupération du mealTrain:", error);
            }
        };
        fetchData();
    }, [mealTrainId]);

    console.log("mealTrainInfo", mealTrainInfo)

    type EditableMealTrain = Omit<MealTrains, 'startDate' | 'endDate'> & {
        startDate: string | undefined;
        endDate: string | undefined;
    };
    const [editFields, setEditFields] = useState<Partial<EditableMealTrain>>({});
    const openModal = (dateId: string) => {
        console.log("Modal ouverte pour :", dateId);
        setSelectedDateId(dateId);
        setIsModalOpen(true);
    };


    const closeModal = () => {
        console.log("@@@@@@@@@@@@@@@@@@@")
        setIsModalOpen(false);
        setNotes('');
        setMealDescription('');
        setReminderDays(1);
    };
    const handleSubmit = async () => {
        console.log("selectedDateId =", selectedDateId, "user =", user);

        if (!selectedDateId || !user) return;
        console.log("+++++++++++++++")

        try {

            const desc = mealDescription;
            const note = notes;

            console.log("notes=", notes, "mealDescription=", mealDescription)
            await MealTrainService.volunteerForDate(selectedDateId, user.id, user.name, note, desc);
            await MealTrainService.updateReminderDays(selectedDateId, reminderDays);
            console.log("----------------")

            //c etait avant en vert mais je ne sais pas si c utile ou pas
            // עדכון הסטייט של הארוחות כך שהארוחה תכלול את המתנדב החדש
            setMeals((prevMeals) =>
                prevMeals.map((meal) =>
                    meal.id === selectedDateId
                        ? {
                            ...meal,
                            volunteer_user_id: user.id,
                            volunteer_name: user.name,
                            notes: note,
                            meal_description: desc,
                        }
                        : meal
                )
            );

            showSuccessToast(`תודה על ההתנדבות! תקבל תזכורת ${reminderDays} ימים לפני הזמן ✉️`);


            closeModal();
            // Optionnel : mettre à jour l’état local des repas ici
        } catch (error) {
            console.error('Erreur lors de l’enregistrement :', error);
        }
    };


    //עריכת שדות
    const editMealTrain = () => {
        setEditFields({
            name: mealTrainInfo?.name || '',
            address: mealTrainInfo?.address || '',
            startDate: mealTrainInfo?.startDate ? new Date(mealTrainInfo.startDate).toISOString() : '',
            endDate: mealTrainInfo?.endDate ? new Date(mealTrainInfo.endDate).toISOString() : '',
            // peopleCount: mealTrainInfo?.peopleCount || 0,
            deliveryTime: mealTrainInfo?.deliveryTime || '',
            dietaryInfo: mealTrainInfo?.dietaryInfo || '',
            adults: mealTrainInfo?.adults || 0,
            childrens: mealTrainInfo?.childrens || 0,
        });
        setEditModalOpen(true);
    };




    const closeEditMealModal = () => setEditModalOpen(false);


    const saveMealTrainEdits = async () => {
        if (!mealTrainInfo || !mealTrainId) return;

        const updates: Partial<MealTrains> = {
            ...editFields,
            startDate: editFields.startDate ? new Date(editFields.startDate) : undefined,
            endDate: editFields.endDate ? new Date(editFields.endDate) : undefined,
        };
        try {
            console.log("Updates envoyés au backend :", updates);
            const updatedMealTrain = await MealTrainService.updateMealTrain(mealTrainId, updates);

            // Mets à jour localement le state avec les données retournées du backend
            setMealTrainInfo({
                ...updatedMealTrain,
                startDate: new Date(updatedMealTrain.startDate),
                endDate: new Date(updatedMealTrain.endDate),
                createdAt: new Date(updatedMealTrain.createdAt),
            });

            setEditModalOpen(false);
            showSuccessToast('✅ הפרטים נשמרו בהצלחה!');
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            toast.error("שגיאה בעת שמירת השינויים.");
        }
    };


    const toggleShareModal = () => setShareModalOpen(!shareModalOpen);
    const closeUpdateModal = () => setUpdateModalOpen(false);


    // //const subject = "עדכון ארוכה";
    // const text = "שלום למתנדבים, יש עדכון חשוב לגבי רכבת הארוחות...";
    // const openUpdateModal = () => {
    //     setUpdateMessage('שלום למתנדבים, יש עדכון חשוב לגבי רכבת הארוחות...');
    //     sendUpdateToVolunteers(mealTrainId, text);
    //     setUpdateModalOpen(true);
    // };
    // const sendUpdate = async () => {
    //     try {
    //         if (!mealTrainId) return;

    //         // const emails = await getVolunteerEmails(mealTrainId);

    //         if (emails.length === 0) {
    //             alert("אין מתנדבים לשלוח אליהם הודעה.");
    //             return;
    //         }
    //         //        await sendUpdateToVolunteers(emails, updateMessage);

    //         alert("ההודעה נשלחה בהצלחה!");
    //         setUpdateModalOpen(false);
    //     } catch (error) {
    //         console.error("שגיאה בשליחת המייל :", error);
    //         alert("אירעה שגיאה בעת שליחת ההודעה.");
    //     }
    // };


    const openUpdateModal = () => {
        setUpdateMessage('שלום למתנדבים, יש עדכון חשוב לגבי רכבת הארוחות...');
        setUpdateModalOpen(true);
    };

    const sendUpdate = async () => {
        try {
            if (!mealTrainId) return;

            const response = await MealTrainService.sendUpdateToVolunteers(mealTrainId, updateMessage);

            toast.success("ההודעה נשלחה בהצלחה!");
            setUpdateModalOpen(false);
        } catch (error) {
            console.error("שגיאה בשליחת המייל :", error);
            toast.error("אירעה שגיאה בעת שליחת ההודעה.");
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto text-right" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <button className="text-lg">←</button>
                <h1 className="text-xl font-bold">משפחת {mealTrainInfo?.name}</h1>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">מנהל</span>
            </div>

            <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex gap-2 items-center mb-6">
                <span className="text-2xl">✅</span>
                <p><strong> {user?.name ?? ''}, הצטרפת לרכבת הארוחות!</strong> עכשיו תוכל(י) לראות את רכבת הארוחות הזו ברשימה שלך ולהתנדב לתאריכים פנויים</p>
            </div>

            <div className="bg-white shadow rounded-lg p-4 mb-6 space-y-2">
                <p className="info-icon">📍 {mealTrainInfo?.address}</p>
                <p className="info-icon">
                    📅 {mealTrainInfo?.startDate && mealTrainInfo?.endDate
                        ? formatDateRange(mealTrainInfo.startDate, mealTrainInfo.endDate, 'he')
                        : '---'}
                </p>
                <p className="info-icon">👥 {mealTrainInfo?.adults} מבוגרים + {mealTrainInfo?.childrens} ילדים</p>
                <p className="info-icon">🕒 משלוח מועדף: {mealTrainInfo?.deliveryTime}</p>
                <p className="flex items-center bg-yellow-100 border-l-4 border-yellow-400 px-3 py-2 mt-3 rounded-r-md text-sm text-yellow-800">
                    <span className="font-bold">אלרגיות והגבלות:  </span> {mealTrainInfo?.dietaryInfo}
                </p>

            </div>

            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h3 className="text-md font-semibold mb-2">ניהול רכבת הארוחות</h3>
                <div className="flex gap-2 flex-wrap">
                    <button className="bg-blue-600 text-white rounded px-4 py-2" onClick={editMealTrain}>ערוך פרטים</button>
                    <button className="bg-gray-200 text-gray-800 rounded px-4 py-2" onClick={toggleShareModal}>שתף</button>
                    <button className="bg-gray-200 text-gray-800 rounded px-4 py-2" onClick={openUpdateModal}>שלח עדכון</button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3">לוח זמנים - התנדבויות</h3>
                {mealTrainDates.map((meal) => {
                    console.log("meal", meal);
                    const isTaken = !!meal.volunteerUserId;
                    //const isMine = mealTrainDates.find(d => d.volunteerUserId === user?.id);
                    const isMine = meal.volunteerUserId === user?.id;

                    // const volunteerUserid = meal.volunteerUserId;
                    // const userId = user?.id;
                    console.log(`Repas le ${meal.date}: isTaken=${isTaken}, isMine=${isMine}, volunteerUserId=${meal.volunteerUserId}, user.id=${user?.id}`);



                    return (
                        <div key={meal.id} className="flex items-center justify-between border p-2 rounded mb-2">
                            <div>
                                <p className="text-sm text-gray-700">
                                    {new Date(meal.date).toLocaleDateString('he-IL', {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {isMine ? 'אתם' : isTaken ? meal.volunteerName || 'מתנדב' : 'זמין להתנדבות'}
                                </p>
                            </div>

                            <div>
                                {isMine ? (
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300"
                                        disabled>
                                        הארוחה שלכם
                                    </button>
                                ) : isTaken ? (
                                    <button className="bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-xl shadow-md cursor-not-allowed"
                                        disabled>
                                        תפוס
                                    </button>
                                ) : (
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300"
                                        onClick={() => openModal(meal.id)}
                                    >
                                        התנדב
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* כפתור התנדב*/}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button onClick={closeModal} className="absolute top-2 left-2 text-gray-500">×</button>
                        <h2 className="text-xl font-semibold mb-4 text-center">התנדבות לארוחה</h2>

                        <p className="text-sm text-gray-600 mb-1">השם שלכם</p>
                        <input
                            type="text"
                            value={user?.name ?? ''}
                            disabled
                            className="w-full border rounded p-2 mb-3 bg-gray-100 text-gray-800"
                        />

                        <p className="text-sm text-gray-600 mb-1">מה תביא?</p>
                        <input
                            type="text"
                            placeholder="למשל: אורז עם עוף, סלט, מרק..."
                            value={mealDescription}
                            onChange={(e) => setMealDescription(e.target.value)}
                            className="w-full border rounded p-2 mb-3"
                        />

                        <p className="text-sm text-gray-600 mb-1">הערות (רשות)</p>
                        <textarea

                            placeholder="מידע נוסף, הגבלות, זמן הגעה..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border rounded p-2 mb-3"
                        />

                        <p className="text-sm text-gray-600 mb-2">מתי להזכיר לכם?</p>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3].map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setReminderDays(day)}
                                    className={`flex-1 border rounded p-2 ${reminderDays === day ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    {day === 1 ? 'יום לפני' : `${day} ימים לפני`}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={closeVolunteerModal} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">ביטול</button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">התנדב</button>
                        </div>
                    </div>
                </div>
            )}

            {/* עריכה  */}
            {editModalOpen && (
                <Modal onClose={closeEditMealModal}>
                    <div className="relative">

                        <h2 className="text-xl font-bold mb-4">עריכת פרטי הרכבת</h2>
                        <button onClick={() => setEditModalOpen(false)} className="absolute top-2 left-2 text-gray-500">×</button>
                        <label className="block mb-2">שם המשפחה</label>
                        <input
                            type="text"
                            className="w-full mb-4 p-2 border rounded"
                            value={editFields.name || ''}
                            onChange={e => setEditFields({ ...editFields, name: e.target.value })}
                        />

                        <label className="block mb-2">מספר מבוגרים</label>
                        <input
                            type="number"
                            className="w-full mb-4 p-2 border rounded"
                            value={editFields.adults || ''}
                            onChange={e =>
                                setEditFields({
                                    ...editFields,
                                    adults: Number(e.target.value),
                                })
                            }
                        />

                        <label className="block mb-2">מספר ילדים</label>
                        <input
                            type="number"
                            className="w-full mb-4 p-2 border rounded"
                            value={editFields.childrens || ''}
                            onChange={e =>
                                setEditFields({
                                    ...editFields,
                                    childrens: Number(e.target.value),
                                })
                            }
                        />


                        <label className="block mb-2">אלרגיות והגבלות</label>
                        <textarea
                            className="w-full mb-4 p-2 border rounded"
                            value={editFields.dietaryInfo || ''}
                            onChange={e =>
                                setEditFields({ ...editFields, dietaryInfo: e.target.value })
                            }
                        />

                        <label className="block mb-2">תאריך התחלה</label>
                        <input
                            type="date"
                            className="w-full mb-4 p-2 border rounded"
                            value={editFields.startDate?.slice(0, 10) || ''}
                            onChange={e =>
                                setEditFields({ ...editFields, startDate: e.target.value })
                            }
                        />

                        <label className="block mb-2">תאריך סיום</label>
                        <input
                            type="date"
                            className="w-full mb-4 p-2 border rounded"
                            value={editFields.endDate?.slice(0, 10) || ''}
                            onChange={e =>
                                setEditFields({ ...editFields, endDate: e.target.value })
                            }
                        />

                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setEditModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">
                                ביטול
                            </button>
                            <button onClick={saveMealTrainEdits} className="bg-green-500 text-white px-4 py-2 rounded">
                                שמור
                            </button>
                        </div>
                    </div>

                </Modal>
            )}

            {shareModalOpen && (
                <Modal onClose={toggleShareModal}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">שתף את רכבת הארוחות</h2>
                        <button onClick={toggleShareModal}>×</button>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-gray-100 px-3 py-2 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-gray-700 break-all">{fullUrl}</span>
                            <button onClick={handleCopy} title="העתק קישור">
                                <Square2StackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 transition" />
                            </button>
                        </div>


                        <a href={`https://wa.me/?text=${encodeURIComponent(`הצטרפו לרכבת הארוחות של ${mealTrainInfo?.name}!\nכתובת: ${mealTrainInfo?.address}\nתאריכים: ${mealTrainInfo?.startDate?.toLocaleDateString()} → ${mealTrainInfo?.endDate?.toLocaleDateString()}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border rounded hover:bg-green-50">
                            <FaWhatsapp size={20} color="#25D366" />
                            ווטסאפ
                        </a>
                        <a href={`mailto:?subject=${encodeURIComponent('הצטרפות לרכבת הארוחות')}&body=${encodeURIComponent(`הצטרפו לרכבת הארוחות של ${mealTrainInfo?.name}!\nכתובת: ${mealTrainInfo?.address}\nתאריכים: ${mealTrainInfo?.startDate?.toLocaleDateString()} → ${mealTrainInfo?.endDate?.toLocaleDateString()}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100">
                            <FaEnvelope size={20} color="#D44638" />
                            מייל
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border rounded hover:bg-blue-50">
                            <FaFacebook size={20} color="#1877F2" />
                            פייסבוק
                        </a>
                        {copied && (
                            <div className="fixed bottom-4 right-4 bg-white text-gray-700 text-sm px-4 py-2 rounded shadow-lg z-50">
                                הקישור הועתק
                            </div>
                        )}

                    </div>
                </Modal>
            )}

            {/* שליחת עדכון למתנדבים */}
            {/* {updateModalOpen && (
                <Modal onClose={closeUpdateModal}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">שליחת עדכון למתנדבים</h2>
                        <button onClick={closeUpdateModal}>×</button>
                    </div>
                    <label className="block text-sm font-semibold mb-1">הודעה</label>
                    <textarea rows={5} className="w-full p-2 border rounded mb-4" value={updateMessage} onChange={e => setUpdateMessage(e.target.value)} placeholder="כתוב כאן את העדכון שברצונך לשלוח למתנדבים..." />
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-gray-200 rounded" onClick={closeUpdateModal}>ביטול</button>
                        <button className="flex-1 py-2 bg-blue-600 text-white rounded" onClick={sendUpdate}>שלח</button>
                    </div>
                </Modal>
            )} */}

            {/* שליחת עדכון למתנדבים */}
            {updateModalOpen && (
                <Modal onClose={closeUpdateModal}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">שליחת עדכון למתנדבים</h2>
                        <button onClick={closeUpdateModal} className="text-xl font-bold">×</button>
                    </div>

                    <label className="block text-sm font-semibold mb-1">הודעה</label>
                    <textarea
                        rows={5}
                        className="w-full p-2 border rounded mb-4"
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        placeholder="כתוב כאן את העדכון שברצונך לשלוח למתנדבים..."
                    />

                    <div className="flex gap-2">
                        <button
                            className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={closeUpdateModal}
                        >
                            ביטול
                        </button>
                        <button
                            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={sendUpdate}
                        >
                            שלח
                        </button>
                    </div>
                </Modal>
            )}

            {showToast && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 whitespace-pre-line">
                    {toastMessage}
                </div>
            )}


{/* להשאיר ולא למחוק */}
            {/* <div className="mt-6 space-y-4">
                {meals
                    .filter((meal) => meal.volunteerUserId) // uniquement ceux qui sont pris
                    .map((meal) => (
                        <div
                            key={meal.id}
                            className="bg-white shadow-md rounded-xl p-4 border border-gray-100"
                        >
                            <p className="text-gray-600 text-sm mb-1">
                                {new Date(meal.date).toLocaleDateString('he-IL', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            </p>
                            <p className="font-semibold text-gray-800">
                                {meal.volunteerName}
                            </p>
                            <p className="text-gray-700">{meal.mealDescription}</p>
                        </div>
                    ))}
            </div> */}


        </div>
    );
};

export default Manage;