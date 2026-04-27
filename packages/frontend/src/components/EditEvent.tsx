//EditEvent.tsx
import { Event, MealType } from '@eventix/shared';
import { useTranslation } from 'react-i18next';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const TrashIcon = FaTrash as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const mealTypes: MealType[] = ['meat', 'dairy', 'vegetarian', 'vegan', 'kosher', 'bbq', 'other'];
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const BUCKET_NAME = 'event-thumbnails';
const getImageUrl = (path: string) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
};

interface EditEventProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onCreateNewEvent: (eventData: Partial<Event>) => void;
  editedEvent: Partial<Event>;
  originalEvent: Event;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isDuplicate?: boolean; // Optional prop to indicate if this is a duplicate event 
  onThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveThumbnail: () => void;
}

const EditEvent = ({
  open,
  onClose,
  onSave,
  onCreateNewEvent,
  editedEvent,
  originalEvent,
  onChange,
  isDuplicate = false, // Default to false if not provided
  onThumbnailChange,
  onRemoveThumbnail
}: EditEventProps) => {
  const { t }: { t: (key: string) => string } = useTranslation();

  if (!open) return null;


  const handleCreateClick = () => {

    const combinedEvent = { ...originalEvent, ...editedEvent };
    if (!combinedEvent.title || !combinedEvent.datetime) {
      // alert('Please fill in a title and date');
      toast.error('Please fill in a title and date')
      return;
    }
    const newEventData: Partial<Event> = { ...combinedEvent };
    delete newEventData.id;
    onCreateNewEvent(newEventData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto space-y-4 mb-4 pr-1" style={{ maxHeight: '70vh' }}>
          <h3 className="text-xl font-semibold mb-4">{t("EditEvent.edit event")}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.title")}</label>
              <input
                name="title"
                value={editedEvent.title || ''}
                placeholder={originalEvent.title ?? ''}
                onChange={onChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.description")}</label>
              <textarea
                name="description"
                value={editedEvent.description || ''}
                placeholder={originalEvent.description ?? ''}
                onChange={onChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.location")}</label>
              <input
                name="location"
                value={editedEvent.location || ''}
                placeholder={originalEvent.location ?? ''}
                onChange={onChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.date")}  {t("EditEvent.time")}</label>
              <input
                name="datetime"
                type="datetime-local"
                value={
                  editedEvent.datetime !== undefined
                    ? new Date(editedEvent.datetime).toISOString().slice(0, 16)
                    : originalEvent.datetime
                      ? new Date(originalEvent.datetime).toISOString().slice(0, 16)
                      : ''
                }
                onChange={onChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.language")}</label>
              <select
                name="language"
                value={editedEvent.language || originalEvent.language || ''}
                onChange={onChange}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>{t("EditEvent.select language")}</option>
                <option value="en">English</option>
                <option value="he">עברית</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.meal type")}</label>
              <select
                name="mealType"
                value={editedEvent.mealType || originalEvent.mealType || ''}
                onChange={onChange}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>{t("EditEvent.select meal type")}</option>
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`EditEvent.meal types.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("EditEvent.expected count")}</label>
              <input
                name="expectedCount"
                type="number"
                value={editedEvent.expectedCount ?? ''}
                placeholder={
                  originalEvent.expectedCount !== undefined
                    ? String(originalEvent.expectedCount)
                    : ''
                }
                onChange={onChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex items-center gap-2">
  <input
    name="isLimited"
    type="checkbox"
    checked={editedEvent.isLimited ?? originalEvent.isLimited ?? false}
    onChange={(e) =>
      onChange({
        ...e,
        target: {
          ...e.target,
          name: 'isLimited',
          value: e.target.checked,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  />
  <label className="text-sm">{t("EditEvent.is limited")}</label>
  <input
    name="description"
    type="text"
    placeholder={editedEvent.isLimited ? t("EditEvent.yes") : t("EditEvent.no")}
  />
</div>


            <div className="flex justify-center mt-4 mb-8">
              <label className="relative cursor-pointer w-32 h-32">
                {editedEvent.thumbnail ? (
                  <img
                    src={getImageUrl(editedEvent.thumbnail)}
                    alt="Thumbnail"
                    className="rounded-lg object-cover w-full h-full border-4 border-blue-500 shadow-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                    <span className="text-gray-400 text-3xl">+</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onThumbnailChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            {editedEvent.thumbnail && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    Swal.fire({
                      title: t("EditEvent.remove image question"),
                      text: t("EditEvent.remove image information"),
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: t('EditEvent.remove image confirm'),
                      cancelButtonText: t('EditEvent.cancel'),
                      background: "#fff",
                      color: "#333",
                      backdrop: `rgba(0,0,0,0.6)`,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        onRemoveThumbnail(); // replace with your remove function
                      }
                    });
                  }}
                  className="text-sm text-red-600 hover:underline mt-2"
                >
                  <TrashIcon className="inline-block mr-1" />
                  {t('EditEvent.remove image')}
                </button>
              </div>
            )}

          </div>
        </div>

        <div className="flex justify-end gap-3 flex-wrap mt-auto">
          {isDuplicate && (
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t("EditEvent.duplicate event")}
            </button>
          )}

          {!isDuplicate && (
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t("EditEvent.save")}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {t("EditEvent.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
