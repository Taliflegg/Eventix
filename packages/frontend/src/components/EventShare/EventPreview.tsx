import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom"
function EventPreview() {
  const { t }: { t: (key: string) => string } = useTranslation();
  const navigate = useNavigate();
  const { token = '' } = useParams();
  const loginorsignin = (type: string) => {
    const eventUrl = `/share/${token}`;
    localStorage.setItem('eventSharedUrl', eventUrl);
    if (type === "signup") {
      navigate('/register')
    }
    else {
      navigate('/login')
    }
  }
  const tdStyle: React.CSSProperties = {
    padding: '10px',
    borderBottom: '1px solid #eee',
    textAlign: 'right',
  };
  const thStyle: React.CSSProperties = {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    textAlign: 'right',
  };
  return <>
<div className="flex flex-col items-center space-y-6 p-6">
  {/* כותרת ראשית */}
  <h2 className="text-2xl font-bold text-center text-gray-800">
    {t('EventPreview.seaMenu')}
  </h2>
  <div className="flex justify-center gap-4 mt-6">
  <button
    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg"
    onClick={() => loginorsignin("signin")}
  >
   התחברות
  </button>
  <button
    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg"
    onClick={() => loginorsignin("signup")}
  >
    הרשמה
  </button>
</div>
  {/* כרטיס מנה */}
  <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-6 border border-gray-200 blur" >
    <div className="w-full rounded-2xl p-4 shadow-md border border-gray-200 bg-white transition hover:shadow-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 text-center">
        מנה עיקרית
      </h3>
      {/* בלוק תיאור המנה */}
      <div className="space-y-4">
        <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
          <span className="text-base font-medium text-gray-800">ארוחה חלבית</span>
          <p className="text-sm text-gray-500 mt-1">אלרגיות</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              תג
            </span>
            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              נוסף
            </span>
          </div>
        </div>
        {/* טבלה */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-t border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th style={thStyle}>{t('MealEventView.dish_name')}</th>
                <th style={thStyle}>{t('MealEventView.dish_brought_by')}</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td style={tdStyle}>לזניה</td>
                  <td style={tdStyle}>ראובן</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
 </>
}
export default EventPreview