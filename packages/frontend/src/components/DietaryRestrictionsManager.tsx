import { useEffect, useState } from 'react';
import { getAllDietaryRestrictions, createDietaryRestriction, updateDietaryRestrictionByName, deleteDietaryRestrictionByName } from '../services/dietaryRestrictionsService';
import { DietaryRestriction } from '@eventix/shared';
import { toast } from 'react-toastify';

interface Props {
  isAdmin: boolean;
}

// SVG אייקונים
const PencilIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M16.862 3.487a2.5 2.5 0 0 1 3.535 3.535l-12.02 12.02a2 2 0 0 1-.878.51l-4 1a1 1 0 0 1-1.213-1.213l1-4a2 2 0 0 1 .51-.878l12.02-12.02z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 4v16m8-8H4"/>
  </svg>
);

const DietaryRestrictionsManager: React.FC<Props> = ({ isAdmin }) => {
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    if (showManager) fetchRestrictions();
    // eslint-disable-next-line
  }, [showManager]);

  const fetchRestrictions = async () => {
    try {
      const data = await getAllDietaryRestrictions();
      setRestrictions(data);
    } catch (err) {
      toast.error('שגיאה בטעינת מגבלות תזונה');
    }
  };

  const handleEdit = (id: string, name: string) => {
    setEditing(id);
    setNewName(name);
  };

  const handleUpdate = async (oldName: string) => {
    if (!newName.trim()) return;
    try {
      await updateDietaryRestrictionByName(oldName, newName.trim());
      toast.success('עודכן בהצלחה');
      setEditing(null);
      setNewName('');
      fetchRestrictions();
    } catch {
      toast.error('שגיאה בעדכון');
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק?')) return;
    try {
      await deleteDietaryRestrictionByName(name);
      toast.success('נמחק בהצלחה');
      fetchRestrictions();
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createDietaryRestriction({ name: newName.trim() });
      toast.success('נוספה בהצלחה');
      setAddMode(false);
      setNewName('');
      fetchRestrictions();
    } catch {
      toast.error('שגיאה בהוספה');
    }
  };

  if (!isAdmin) return null;

  return (
    <div>
      {!showManager ? (
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}
          onClick={() => setShowManager(true)}
        >
         ניהול מגבלות תזונה
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto my-8 border">
          <h3 className="text-lg font-bold mb-4">ניהול מגבלות תזונה</h3>
          <ul>
            {restrictions.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 border-b">
                {editing === r.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="ml-2 text-green-600 hover:text-green-800"
                      onClick={() => handleUpdate(r.name)}
                      title="שמור"
                    >✔️</button>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setEditing(null)}
                      title="ביטול"
                    >✖️</button>
                  </>
                ) : (
                  <>
                    <span>{r.name}</span>
                    <div>
                      <button
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(r.id, r.name)}
                        title="ערוך"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(r.name)}
                        title="מחק"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          {addMode ? (
            <div className="flex items-center mt-4">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="שם מגבלה חדשה"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
              <button
                className="ml-2 text-green-600 hover:text-green-800"
                onClick={handleAdd}
                title="הוסף"
              >✔️</button>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => { setAddMode(false); setNewName(''); }}
                title="ביטול"
              >✖️</button>
            </div>
          ) : (
            <button
              className="mt-4 flex items-center text-green-600 hover:text-green-800"
              onClick={() => { setAddMode(true); setNewName(''); }}
            >
              <span className="ml-1"><PlusIcon /></span> הוסף מגבלה חדשה
            </button>
          )}
          <button
            className="mt-4 text-gray-600 hover:text-gray-800"
            onClick={() => setShowManager(false)}
          >
            סגור
          </button>
        </div>
      )}
    </div>
  );
};

export default DietaryRestrictionsManager;