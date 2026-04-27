import React, { useEffect, useState } from 'react';
import { AccountLocation, LocationType } from '@eventix/shared';
import { useTranslation } from 'react-i18next';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: AccountLocation) => void;
  initialData?: AccountLocation | null;
}
const initialLocation: AccountLocation = {
  id: '',
  name: '',
  address: '',
  locationType: 'other',
};


const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) => {

  
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState<AccountLocation>(initialLocation);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { t }: { t: (key: string) => string } = useTranslation();


  useEffect(() => {
    if (isOpen) {
      const locationToUse = initialData || initialLocation;
      const [s = '', n = '', c = ''] = locationToUse.address?.split(',').map((x) => x.trim()) || [];
      setStreet(s);
      setHouseNumber(n);
      setCity(c);
      setLocation(locationToUse);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen, initialData]);


  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!location.name.trim()) {
      newErrors.name = t('Validation.required');
    }
    if (!street.trim()) {
      newErrors.street = t('Validation.required');
    }
    if (!houseNumber.trim()) {
      newErrors.houseNumber = t('Validation.required');
    } else if (!/^\d+$/.test(houseNumber.trim())) {
      newErrors.houseNumber = t('Validation.house_number_numeric');
    }
    if (!city.trim()) {
      newErrors.city = t('Validation.required');
    }
    if (!location.locationType) {
      newErrors.locationType = t('Validation.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const fullAddress = [street, houseNumber, city].filter(Boolean).join(', ');
    onSubmit({ ...location, address: fullAddress });
    onClose();
  };

  if (!isOpen) return null;
  const isEdit = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300">
      <div
        className={`bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative transform transition-all duration-300
        ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isEdit ? t('LocationModal.editTitle') : t('LocationModal.addTitle')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">{t('LocationModal.name')}</label>
            <input
              type="text"
              value={location.name}
              onChange={(e) => setLocation({ ...location, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              required
            />
            {errors.name && (
              <div className="text-red-600 text-sm mt-1">{errors.name}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-700">{t('LocationModal.address')}</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder={t('LocationModal.street')}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                {errors.street && (
                  <div className="text-red-600 text-sm mt-1">{errors.street}</div>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder={t('LocationModal.houseNumber')}
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                {errors.houseNumber && (
                  <div className="text-red-600 text-sm mt-1">{errors.houseNumber}</div>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder={t('LocationModal.city')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                {errors.city && (
                  <div className="text-red-600 text-sm mt-1">{errors.city}</div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">{t('LocationModal.type')}</label>
            <select
              value={location.locationType}
              onChange={(e) =>
                setLocation({ ...location, locationType: e.target.value as LocationType })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              required
            >
              <option value="">{t('LocationModal.selectType')}</option>
              <option value="home">{t('LocationModal.home')}</option>
              <option value="parents">{t('LocationModal.parents')}</option>
              <option value="inlaws">{t('LocationModal.inlaws')}</option>
              <option value="friends">{t('LocationModal.friends')}</option>
              <option value="other">{t('LocationModal.other')}</option>
            </select>
            {errors.locationType && (
              <div className="text-red-600 text-sm mt-1">{errors.locationType}</div>
            )}
          </div>

          <div className="pt-3 text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              {isEdit ? t('LocationModal.update') : t('LocationModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
