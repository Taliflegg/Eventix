import React, { useState } from "react";
import { getShareLink } from "../services/eventsService";

// front   להוסיף כפתור של    share event ברגע שילחצו עליו יהיה בקשה של  get
// לקבלת הקישור (קבוצה של ה share link) שיופיע עם אפשרות של העתקה (גיטי)

const EventLink: React.FC = () => {
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    // const handleShareClick = async () => {
    //     setLoading(true);
    //     setCopied(false);
    //     try {
    //         // החלף בכתובת ה-API המתאימה לקבלת הקישור
    //         const response = await fetch("/api/event/share-link");
    //         const data = await response.json();
    //         setShareLink(data.link);
    //     } catch (error) {
    //         setShareLink(null);
    //     }
    //     setLoading(false);

    // };
    const handleShareClick = async () => {
        setLoading(true);
        setCopied(false);
        try {
          const data = await getShareLink(); // קריאה לפונקציה בסרוויס
          setShareLink(data.link);
        } catch (error) {
          setShareLink(null);
        }
        setLoading(false);
      };

    const handleCopy = async () => {
        if (shareLink) {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div>
            <button onClick={handleShareClick} disabled={loading}>
                {loading ? "טוען..." : "שתף אירוע"}
            </button>
            {shareLink && (
                <div style={{ marginTop: 8 }}>
                    <input
                        type="text"
                        value={shareLink}
                        readOnly
                        style={{ width: "70%" }}
                    />
                    <button onClick={handleCopy} style={{ marginLeft: 8 }}>
                        העתק
                    </button>
                    {copied && <span style={{ marginLeft: 8 }}>הועתק!</span>}
                </div>
            )}
        </div>
    );
};

export default EventLink;
// import React, { useState } from "react"; // ייבוא של React ופונקציית useState לניהול מצב רכיב

// const EventLink: React.FC = () => { // הגדרת רכיב פונקציונלי בשם EventLink עם טיפוס TypeScript React.FC
//     const [shareLink, setShareLink] = useState<string | null>(null); // יצירת מצב shareLink לאחסון הקישור לשיתוף
//     const [copied, setCopied] = useState(false); // יצירת מצב copied כדי לעקוב אם הקישור הועתק
//     const [loading, setLoading] = useState(false); // יצירת מצב loading כדי לעקוב אחר מצב הטעינה

//     const handleShareClick = async () => { // הגדרת פונקציה אסינכרונית handleShareClick
//         setLoading(true); // עדכון מצב loading ל-true
//         setCopied(false); // עדכון מצב copied ל-false
//         try { // התחלת בלוק try
//             const response = await fetch("/api/event/share-link"); // שליחת בקשת GET לשרת
//             const data = await response.json(); // המרת התגובה לאובייקט JSON
//             setShareLink(data.link); // עדכון מצב shareLink עם הקישור שהתקבל
//         } catch (error) { // בלוק catch לטיפול בשגיאות
//             setShareLink(null); // עדכון shareLink ל-null במקרה של שגיאה
//         }
//         setLoading(false); // עדכון מצב loading ל-false לאחר סיום הבקשה
//     };

//     const handleCopy = async () => { // הגדרת פונקציה אסינכרונית handleCopy
//         if (shareLink) { // בדיקה אם יש קישור לשיתוף
//             await navigator.clipboard.writeText(shareLink); // העתקת הקישור ללוח הגזירים
//             setCopied(true); // עדכון מצב copied ל-true
//             setTimeout(() => setCopied(false), 1500); // לאחר 1.5 שניות, עדכון copied ל-false
//         }
//     };

//     return ( // החזרת JSX עבור הרכיב
//         <div>
//             <button onClick={handleShareClick} disabled={loading}> // כפתור לשיתוף
//                 {loading ? "טוען..." : "שתף אירוע"} // טקסט הכפתור משתנה לפי מצב הטעינה
//             </button>
//             {shareLink && ( // אם יש קישור לשיתוף
//                 <div style={{ marginTop: 8 }}> // יצירת div עם רווח עליון
//                     <input
//                         type="text"
//                         value={shareLink} // שדה טקסט המציג את הקישור
//                         readOnly // עם אפשרות לקריאה בלבד
//                         style={{ width: "70%" }} // הגדרת רוחב
//                     />
//                     <button onClick={handleCopy} style={{ marginLeft: 8 }}> // כפתור להעתקת הקישור
//                         העתק // טקסט הכפתור "העתק"
//                     </button>
//                     {copied && <span style={{ marginLeft: 8 }}>הועתק!</span>} // אם copied הוא true, הצג טקסט "הועתק!"
//                 </div>
//             )}
//         </div>
//     );
// };

// export default EventLink; // ייצוא הרכיב לשימוש בקבצים אחרים
