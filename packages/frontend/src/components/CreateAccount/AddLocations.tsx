import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewAccountData } from './OnboadingFlow';
import { toast } from 'react-toastify';
import { saveLocations } from '../../services/shabbatService';

interface AddLocationsProps {
  onNext: () => void;
  onBack: () => void;
  data: NewAccountData;
  setData: React.Dispatch<React.SetStateAction<NewAccountData>>;
}

const AddLocations: React.FC<AddLocationsProps> = ({ onNext, onBack, data, setData }) => {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [parentsAddress, setParentsAddress] = useState<string>('');
  const [inlawsAddress, setInlawsAddress] = useState<string>('');

  // const handleSaveLocations = async (): Promise<void> => {
  //   const locations: { name: string; address: string; locationType: string }[] = [];

  //   if (data.additionalLocations) {
  //     locations.push(
  //       ...data.additionalLocations.map(loc => ({
  //         name: loc.name,
  //         address: loc.address,
  //         locationType: loc.type ?? 'other',
  //       }))
  //     );
  //   }

  //   if (parentsAddress) {
  //     locations.push({ name: t('AddLocationsShabbat.parents_label'), address: parentsAddress, locationType: 'parents' });
  //   }

  //   if (inlawsAddress) {
  //     locations.push({ name: t('AddLocationsShabbat.inlaws_label'), address: inlawsAddress, locationType: 'inlaws' });
  //   }

  //   setData((prev: NewAccountData) => ({
  //     ...prev,
  //     additionalLocations: locations.length > 0 ? locations : undefined,
  //   }));

  //   try {
  //     const response = await fetch('/api/onboarding/locations', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         userId: data.id,
  //         locations,
  //       }),
  //     });

  //     if (response.ok) {
  //       onNext();
  //     } else {
  //       // alert(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
  //       toast.error(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
  //     }
  //   } catch (error) {
  //     // alert(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
  //     toast.error(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
  //   }
  // };
  const handleSaveLocations = async (): Promise<void> => {
    const locations: { name: string; address: string; locationType: string }[] = [];
    if (data.additionalLocations) {
      locations.push(
        ...data.additionalLocations.map(loc => ({
          name: loc.name,
          address: loc.address,
          locationType: loc.type ?? 'other',
        }))
      );
    }
    if (parentsAddress) {
      locations.push({ name: t('AddLocationsShabbat.parents_label'), address: parentsAddress, locationType: 'parents' });
    }
    if (inlawsAddress) {
      locations.push({ name: t('AddLocationsShabbat.inlaws_label'), address: inlawsAddress, locationType: 'inlaws' });
    }
    setData((prev: NewAccountData) => ({
      ...prev,
      additionalLocations: locations.length > 0 ? locations : undefined,
    }));
    if (!data.id) {
      toast.error(t('AddLocationsShabbat.save_locations_error') || 'User ID is missing.');
      return;
    }
    // try {
    //   const response = await saveLocations(data.id, locations); // הפונקציה עכשיו תופסת את המקרה של undefined
    //   if (response.success) {
    //     onNext();
    //   } else {
    //     toast.error(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
    //   }
    // } catch (error) {
    //   toast.error(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
    // }
    try {
      if (data.id) { // בדוק אם data.id קיים
        const response = await saveLocations(data.id, locations);
        if (response.success) {
          onNext();
        } else {
          toast.error(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
        }
      } else {
        toast.error(t('AddLocationsShabbat.save_locations_error') || 'User ID is missing.');
      }
    } catch (error) {
      toast.error(t('AddLocationsShabbat.save_locations_error') || 'Something went wrong while saving.');
    }
  // };
  
  };

  const handleSkip = (): void => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Screen Indicator */}
      <div className="absolute top-5 right-5 bg-black bg-opacity-10 px-2 py-1 rounded-xl text-xs text-gray-600">
        Step 4/6
      </div>

      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center sticky top-0 z-10">
        <button
          onClick={onBack}
          className="text-lg text-blue-500 mr-4 hover:text-blue-700"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {t('AddLocationsShabbat.add_more_locations_title')}
        </h1>
      </div>

      {/* Content */}
      <div className="px-5 py-5 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            {t('AddLocationsShabbat.where_else_for_shabbat')}
          </h2>
          <p className="text-sm text-gray-600">{t('AddLocationsShabbat.common_places_subtitle')}</p>
        </div>

        {/* Parents Input */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {t('AddLocationsShabbat.parents_label')}
          </label>
          <input
            type="text"
            value={parentsAddress}
            onChange={(e) => setParentsAddress(e.target.value)}
            placeholder={t('AddLocationsShabbat.parents_placeholder')}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* In-Laws Input */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {t('AddLocationsShabbat.inlaws_label')}
          </label>
          <input
            type="text"
            value={inlawsAddress}
            onChange={(e) => setInlawsAddress(e.target.value)}
            placeholder={t('AddLocationsShabbat.inlaws_placeholder')}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Location Previews */}
        <div className="space-y-4 mb-5">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center">
            <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-lg mr-3">
              👨‍👩‍👧‍👦
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{t('AddLocationsShabbat.parents_label')}</div>
              <div className="text-xs text-gray-600">
                {parentsAddress || t('AddLocationsShabbat.parents_placeholder')}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center">
            <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-lg mr-3">
              👰
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{t('AddLocationsShabbat.inlaws_label')}</div>
              <div className="text-xs text-gray-600">
                {inlawsAddress || t('AddLocationsShabbat.inlaws_placeholder')}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={handleSaveLocations}
          className="w-full bg-blue-500 text-white py-4 rounded-lg text-base font-semibold hover:bg-blue-600 mb-3"
        >
          {t('AddLocationsShabbat.save_locations')}
        </button>

        <button
          onClick={handleSkip}
          className="w-full bg-white text-blue-500 border-2 border-blue-500 py-3.5 rounded-lg text-sm font-semibold hover:bg-blue-50"
        >
          {t('AddLocationsShabbat.skip_for_now')}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
};

export default AddLocations;
