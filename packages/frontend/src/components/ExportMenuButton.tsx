import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { apiService } from '../services/apiServices';
import { useTranslation } from 'react-i18next';
import { ClipboardCopy, Download, FileSpreadsheet } from 'lucide-react';
import { getMenuDataAsJSON } from '../services/menuActionService';



declare global {
  interface Window {
    google: any;
  }
}

interface ExportMenuButtonProps {
  eventId: string;
  eventName: string;
  openDirection?: 'left' | 'right';
}

const ExportMenuButton: React.FC<ExportMenuButtonProps> = ({ eventId, eventName, openDirection }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { i18n } = useTranslation(); // גישה לשפה הנוכחית ולשינוי שפה
  const t: (key: string) => string = useTranslation().t; // פונקציה שמחזירה את הטקסט המתורגם

  const isRTL = i18n.language === 'he';

  // אין צורך בפונקציה requestGoogleDriveAccess או ב-exportToGoogleDrive ישן.

  const copyToClipboard = async () => {
    setIsExporting(true);
    try {
      const menuData = await getMenuDataAsJSON(eventId);
      const jsonText = JSON.stringify(menuData, null, 2);
      await navigator.clipboard.writeText(jsonText);
      toast.success(`✅ Menu for "${eventName}" copied to clipboard as JSON! You can now paste it anywhere.`);
    } catch (error: any) {
      console.error('Copy error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('❌ Clipboard access denied. Please allow clipboard permissions and try again.');
      } else {
        toast.error('❌ Failed to copy menu to clipboard. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      toast.info('🔄 Preparing JSON file for download...');
      
      const menuData = await getMenuDataAsJSON(eventId);
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(menuData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventName}-menu.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`✅ Menu for "${eventName}" exported as JSON successfully! File saved as "${eventName}-menu.json"`);
    } catch (error: any) {
      console.error('JSON export error:', error);
      if (error.response?.status === 404) {
        toast.error('❌ Menu not found. Please make sure the event has menu items.');
      } else {
        toast.error('❌ Failed to export menu as JSON. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // --- פונקציה חדשה לייצוא תפריט לגוגל שיט ישירות מהפרונט ---
  const exportToGoogleSheetsFrontend = async (): Promise<void> => {
    setIsExporting(true);
    try {
      if (!window.google || !window.google.accounts) {
        toast.error('❌ Google API לא נטען. נסה לרענן את הדף או לבדוק את חיבור האינטרנט.');
        setIsExporting(false);
        return;
      }

      toast.info('🔄 מבצע התחברות לגוגל...');
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: "1026356442288-5gfnohdl66v4qrfpubnnrvnbo4ijfar4.apps.googleusercontent.com",
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Google OAuth Error:', tokenResponse);

            // הודעות שגיאה מפורטות לפי סוג השגיאה
            if (tokenResponse.error === 'access_denied') {
              if (tokenResponse.error_description?.includes('403')) {
                toast.error('❌ גישה חסומה: האפליקציה לא עברה אימות. הוסיפי את עצמך כמשתמש בדיקה ב-Google Cloud Console.');
              } else {
                toast.error('❌ המשתמש ביטל את ההרשאה או סירב לגשת לאפליקציה.');
              }
            } else if (tokenResponse.error === 'popup_closed_by_user') {
              toast.error('❌ חלון ההתחברות נסגר. נסי שוב.');
            } else if (tokenResponse.error === 'popup_blocked') {
              toast.error('❌ חלון ההתחברות נחסם על ידי הדפדפן. אפשרי חלונות קופצים לאתר זה.');
            } else {
              toast.error(`❌ שגיאה בהתחברות לגוגל: ${tokenResponse.error}`);
            }
            setIsExporting(false);
            return;
          }

          const accessToken = tokenResponse.access_token;
          toast.info('🔄 מקבל נתוני תפריט מהשרת...');

          // שלב 1: קבלת נתוני התפריט מהשרת (כ-JSON)
          let menuData;
          try {

            menuData = await getMenuDataAsJSON(eventId);

            // Check if menuData is an array and not empty, or if it's an object with keys
            const isEmpty =
              !menuData ||
              (Array.isArray(menuData) && menuData.length === 0) ||
              (typeof menuData === 'object' && !Array.isArray(menuData) && Object.keys(menuData).length === 0);

            if (isEmpty) {
              toast.error('❌ לא נמצאו נתוני תפריט לייצוא. ודאי שיש פריטים בתפריט.');
              setIsExporting(false);
              return;
            }
          } catch (err: any) {
            console.error('Server Error:', err);
            if (err.response?.status === 404) {
              toast.error('❌ התפריט לא נמצא. ודאי שהאירוע קיים ויש לו פריטי תפריט.');
            } else if (err.response?.status === 401) {
              toast.error('❌ אין לך הרשאה לגשת לתפריט זה.');
            } else if (err.response?.status >= 500) {
              toast.error('❌ שגיאת שרת. נסי שוב מאוחר יותר.');
            } else {
              toast.error('❌ שגיאה בקבלת נתוני התפריט מהשרת.');
            }
            setIsExporting(false);
            return;
          }

          toast.info('🔄 יוצר גיליון חדש ב-Google Sheets...');

          // שלב 2: יצירת גיליון חדש
          let createSheetRes;
          try {
            createSheetRes = await fetch(
              'https://sheets.googleapis.com/v4/spreadsheets',
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  properties: { title: `${eventName} - Menu` },
                }),
              }
            );
          } catch (err) {
            console.error('Google Sheets Creation Error:', err);
            toast.error('❌ שגיאה ביצירת גיליון חדש. בדקי את חיבור האינטרנט.');
            setIsExporting(false);
            return;
          }

          if (!createSheetRes.ok) {
            const errorData = await createSheetRes.json().catch(() => ({}));
            console.error('Google Sheets API Error:', errorData);

            if (createSheetRes.status === 401) {
              toast.error('❌ הטוקן פג תוקף. נסי להתחבר שוב.');
            } else if (createSheetRes.status === 403) {
              toast.error('❌ אין הרשאה ליצור גיליונות. בדקי את הרשאות Google Sheets.');
            } else if (createSheetRes.status === 429) {
              toast.error('❌ חריגה ממגבלת השימוש ב-Google Sheets. נסי שוב מאוחר יותר.');
            } else {
              toast.error(`❌ שגיאה ביצירת גיליון: ${errorData.error?.message || 'שגיאה לא ידועה'}`);
            }
            setIsExporting(false);
            return;
          }

          const sheet = await createSheetRes.json();
          const spreadsheetId = sheet.spreadsheetId;

          if (!spreadsheetId) {
            toast.error('❌ לא התקבל מזהה גיליון תקין מ-Google.');
            setIsExporting(false);
            return;
          }

          toast.info('🔄 מעתיק נתונים לגיליון...');

          // שלב 3: כתיבת נתונים לגיליון
          try {
            // Ensure menuData is an array of objects
            if (!Array.isArray(menuData) || menuData.length === 0 || typeof menuData[0] !== 'object') {
              throw new Error('menuData is not a valid array of objects');
            }

            // Collect all unique headers from all rows
            const headersSet = new Set<string>();
            menuData.forEach((row: any) => {
              if (row && typeof row === 'object') {
                Object.keys(row).forEach((key) => headersSet.add(key));
              }
            });
            const headers = Array.from(headersSet);

            // Build values array: first row is headers, then each row's values in header order
            const values = [
              headers,
              ...menuData.map((row: any) =>
                headers.map((h) => (row && Object.prototype.hasOwnProperty.call(row, h) ? row[h] : ''))
              ),
            ];

            const writeRes = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=RAW`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  values,
                }),
              }
            );

            if (!writeRes.ok) {
              const errorData = await writeRes.json().catch(() => ({}));
              console.error('Google Sheets Write Error:', errorData);

              if (writeRes.status === 403) {
                toast.error('❌ אין הרשאה לכתוב לגיליון. בדקי את הרשאות Google Sheets.');
              } else {
                toast.error(`❌ שגיאה בכתיבת נתונים: ${errorData.error?.message || 'שגיאה לא ידועה'}`);
              }
              setIsExporting(false);
              return;
            }
          } catch (err) {
            console.error('Google Sheets Write Error:', err);
            toast.error('❌ שגיאה בכתיבת נתונים לגיליון. בדקי את חיבור האינטרנט.');
            setIsExporting(false);
            return;
          }

          toast.success(`✅ התפריט יוצא בהצלחה! פותח את הגיליון...`);
          window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
          setIsExporting(false);
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('❌ שגיאה כללית בייצוא לגוגל שיט. בדקי את הקונסול לפרטים נוספים.');
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className={`group relative p-2 transition-all duration-300 ease-in-out rounded-lg
          ${isExporting ? '' : 'hover:bg-[#28A745]/20'}`}
      >
        {/* Icon with black color */}
        <div className="relative">
          {isExporting ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-green-600 border-r-green-400"></div>
          ) : (
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="black"
            >
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className={`absolute mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[1000] overflow-hidden animate-in slide-in-from-top-2 duration-200 ${openDirection === 'right' ? 'right-0' : 'left-0'}`}>
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">{t('ExportMenuButton.export_options')}</h3>
            <p className="text-xs text-gray-500 mt-1">{t('ExportMenuButton.choose_how')}</p>
          </div>

          {/* Options */}
          <div className="py-2">
            {/* Copy to Clipboard */}
            <button
              onClick={() => {
                copyToClipboard();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#28A745]/20 transition-colors duration-200 flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#28A745]/20 transition-colors duration-200">
                <ClipboardCopy className="w-5 h-5 text-gray-800" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t('ExportMenuButton.copy_json')}</div>
                <div className="text-xs text-gray-500">{t('ExportMenuButton.copy_json_desc')}</div>
              </div>
            </button>

            {/* Download as JSON */}
            <button
              onClick={() => {
                exportToJSON();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#28A745]/20 transition-colors duration-200 flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#28A745]/20 transition-colors duration-200">
                <Download className="w-5 h-5 text-gray-800" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t('ExportMenuButton.download_json')}</div>
                <div className="text-xs text-gray-500">{t('ExportMenuButton.download_json_desc')}</div>
              </div>
            </button>

            {/* Export to Google Sheets */}
            <button
              onClick={() => {
                exportToGoogleSheetsFrontend();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#28A745]/20 transition-colors duration-200 flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#28A745]/20 transition-colors duration-200">
                <FileSpreadsheet className="w-5 h-5 text-gray-800" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t('ExportMenuButton.export_sheets')}</div>
                <div className="text-xs text-gray-500" style={isRTL ? { direction: 'rtl', textAlign: 'right' } : {}}>
                  {t('ExportMenuButton.export_sheets_desc')}
                </div>
              </div>
            </button>
          </div>

        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ExportMenuButton;