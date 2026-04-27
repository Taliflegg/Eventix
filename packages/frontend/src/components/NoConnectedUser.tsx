import { useNavigate } from "react-router-dom";

const NoConnectedUser: React.FC= () => {
    const navigate = useNavigate();
    return (
<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
  <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 text-center m-4 sm:m-0">
    <h2 className="text-xl font-bold mb-4">אינך מורשה לבצע פעולה זו</h2>
    <p className="mb-6">ייתכן שהתנתקת נסה להתחבר שוב</p>
    <button
      onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
      className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold"
    >
      להתחברות
    </button>
  </div>
</div>

    );
}
export default NoConnectedUser;