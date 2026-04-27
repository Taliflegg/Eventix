import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchAddUserActivity } from '../services/userActivityService';

const AddUserActivity = () => {
    const [appName, setAppName] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setAppName("MealTrain")
    }, []); // יירץ פעם אחת כשנכנסים לקומפוננטה


    const handleAddActivity = async () => {
        setLoading(true);
        setError(null); // ננקה שגיאות קודם
        try {
            // const response = await fetch('http://localhost:3001/api/user-activity/add', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ app_name: appName }),
            //     credentials: 'include',
            // });
            const response = await fetchAddUserActivity(appName);            
            // const data = await response.json();
            console.log('Activity added:', response);
            // toast.success('Activity added')
        }
        catch (error: any) {
            console.error(error);
            toast.error('Activity added failed: ' + (error.message || 'Unknown error'));
        }
        finally {
            setLoading(false);
        }
    };

    // אם יש טעינה
    if (loading) return <div>Loading...</div>;

    // אם יש שגיאה
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <button onClick={handleAddActivity}>Add Activity</button>
        </div>
    );
};

export default AddUserActivity;
