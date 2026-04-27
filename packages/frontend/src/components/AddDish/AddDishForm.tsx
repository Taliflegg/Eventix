import React, { useState, useEffect } from 'react';
import './AddDishForm.css';
import { addMenuAction } from '../../services/menuActionService';
import { AssignedMenuItem, MenuAction, MenuActionData, User } from '@eventix/shared';
import { useParams } from 'react-router-dom';
import { fetchAuthenticatedUser } from '../../services/usersService';
import { useTranslation } from 'react-i18next'; // 🟢 ייבוא ה־t
import { useSendSocketMessage } from '../hooks/useSendSocketMessage';

interface Category {
  id: string;
  name: string;
}

interface AddDishFormProps {
  onClose: () => void;
  categories: AssignedMenuItem[];
  defaultCategoryId?: string | null;
}

const AddDishForm: React.FC<AddDishFormProps> = ({ onClose, categories, defaultCategoryId }) => {
  const { t }: any = useTranslation(); // 🟢 שימוש ב־t

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [error, setError] = useState('');
  const { eventId } = useParams<{ eventId: string }>();
  const [userid, setUserId] = useState<string>();
  const [Tags, setTags] = useState<string[]>([]);
  const { send: sendSocket } = useSendSocketMessage();

  const toggleTags = (value: string) => {
    setTags(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  useEffect(() => {
    const getUser = async () => {
      const user: User = await fetchAuthenticatedUser();
      setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (defaultCategoryId) {
      setSelectedCategoryId(defaultCategoryId);
    }
  }, [defaultCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedCategoryId) {
      setError(t('addDishForm.errors.nameAndCategoryRequired'));
      return;
    }
    if (!eventId) {
      setError(t('addDishForm.errors.eventIdRequired'));
      return;
    }
    if (!userid) {
      setError(t('addDishForm.errors.userIdRequired'));
      return;
    }

    const actionData: MenuActionData = {
      name,
      notes: description,
      categoryId: selectedCategoryId,
      isCategory: false,
      tags: Tags,
      position: 2
    };

    const menuAction: MenuAction = {
      id: "",
      eventId: eventId,
      userId: userid,
      actionType: 'add_dish',
      actionData: actionData,
      timestamp: new Date(),
    };

    try {
      const response: any = await addMenuAction(menuAction);
      sendSocket({
        type: 'category',
        action: 'add',
        payload: {
          itemId: response.id,
          name: response.name,
          notes: response.notes,
          tags: response.tags,
          categoryId: response.categoryId,
          position: response.position,
        }
      });
      onClose();
    } catch (err) {
      setError(t('addDishForm.errors.serverError'));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{t('addDishForm.title')}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder={t('addDishForm.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder={t('addDishForm.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {/* שדה בחירת קטגוריה – מוצג רק אם אין defaultCategoryId */}
          {!defaultCategoryId && (
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
            >
              <option value="">{t('addDishForm.selectCategory')}</option>
              {categories
                .filter((cat) => cat.item && cat.item.isCategory === true)
                .map((cat) => (
                  <option key={cat.item.id} value={cat.item.id}>
                    {cat.item.name}
                  </option>
                ))}
            </select>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>
              {t('addDishForm.tagsLabel')}:
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              {["Gluten", "peanuts", "soya", "milk", "eggs", "kosher", "vegan"].map(tag => (
                <label key={tag} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  minWidth: '120px',
                  border: '1px solid #28A745',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#F9F9F9'
                }}>
                  <input
                    type="checkbox"
                    checked={Tags.includes(tag)}
                    onChange={() => toggleTags(tag)}
                  />
                  {t(`tags.${tag}`)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="bg-[#28A745] hover:bg-[#218838] text-white font-bold py-2 px-4 rounded m-1" > Submit </button>
          <button type="button" onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded m-1"> Cancel </button>
        </form>
      </div>
    </div>
  );
};

export default AddDishForm;