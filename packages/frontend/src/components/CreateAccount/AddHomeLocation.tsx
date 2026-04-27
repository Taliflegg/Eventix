import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewAccountData } from './OnboadingFlow';
import { addHomeLocationToAccount } from '../../services/shabbatService';

interface Props {
  onNext: () => void;
  onBack: () => void;
  data: NewAccountData;
  setData: React.Dispatch<React.SetStateAction<NewAccountData>>;
}

function AddHomeLocation({ onNext, onBack, data, setData }: Props) {
  const { t }: { t: (key: string) => string } = useTranslation();

  // const AddHomeLocationToAccount = async () => {
  //   try {
  //     const response = await fetch('/api/onboarding/complete', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },

  //       body: JSON.stringify({
  //         userId: data.id,
  //         email: data.email,
  //         accountName: data.accountName,
  //         homeLocation: {
  //           name: data.homeLocation.name,
  //           address: data.homeLocation.address,
  //         },
  //         locationType: 'home',
  //         credentials: 'include',
  //       })

  //     });

  //       onNext();
  //   } catch (error) {
  //     console.error('Error adding home location:', error);
  //   }
  // }
  const AddHomeLocationToAccount = async () => {
    if (!data.id || !data.email || !data.accountName || !data.homeLocation?.name || !data.homeLocation?.address) {
      console.error('חלק מהשדות חסרים');
      return;
    }
  
    try {
      await addHomeLocationToAccount(
        data.id,
        data.email,
        data.accountName,
        {
          name: data.homeLocation.name,
          address: data.homeLocation.address,
        }
      );
  
      onNext();
    } catch (error) {
      console.error('Error adding home location:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-lg text-blue-500 cursor-pointer mr-4 hover:text-blue-700"
        >
          ←
        </button>
        <div className="text-lg font-semibold text-gray-800">
          {t('AddHomeLocationShabbat.add_first_location') || 'Add Your First Location'}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 py-5 max-w-sm mx-auto">
        <div className="text-2xl font-semibold text-gray-800 mb-3 text-center">
          {t('AddHomeLocationShabbat.where_is_home') || 'Where is "home" for you?'}
        </div>

        <div className="text-sm text-gray-600 mb-8 text-center">
          {t('AddHomeLocationShabbat.main_location_subtitle') || 'This will be your main location for Shabbat planning'}
        </div>

        {/* Location Name Input */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            {t('AddHomeLocationShabbat.location_name') || 'Location name'}
          </label>
          <input
            type="text"
            value={data.homeLocation.name}
            onChange={(e) => setData(prev => ({
              ...prev,
              homeLocation: {
                ...prev.homeLocation,
                name: e.target.value
              }
            }))}
            placeholder="Home"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base box-border outline-none focus:border-blue-500"
          />
        </div>

        {/* Address Input */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            {t('AddHomeLocationShabbat.address') || 'Address'}
          </label>
          <input
            type="text"
            value={data.homeLocation.address}
            onChange={(e) => setData(prev => ({
              ...prev,
              homeLocation: {
                ...prev.homeLocation,
                address: e.target.value
              }
            }))}
            placeholder="בנמיני 2, תל אביב"
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base box-border outline-none focus:border-blue-500"
          />
        </div>

        {/* Location Preview */}
        <div className={`bg-white border-2 rounded-lg p-4 my-4 flex items-center ${data.homeLocation.name && data.homeLocation.address ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}>
          <div className="w-11 h-11 rounded-lg flex items-center justify-center mr-3 text-lg bg-blue-100 text-blue-800">
            🏠
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800 mb-1">
              {data.homeLocation.name || 'Home'}
            </div>
            <div className="text-xs text-gray-600">
              {data.homeLocation.address || 'בנמיני 2, תל אביב'}
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-gray-50 border-l-4 border-blue-500 p-3 my-5 rounded-r-lg">
          <div className="text-xs text-gray-600">
            💡 {t('AddHomeLocationShabbat.add_more_locations tip') || 'You can add more locations (parents, in-laws, etc.) later'}
          </div>
        </div>

        {/* Primary Button */}
        <button
          onClick={() => {
            AddHomeLocationToAccount();
          }}
          className="w-full px-4 py-4 bg-blue-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer mt-5 hover:bg-blue-600 transition-colors"
        >
          {t('AddHomeLocationShabbat.add_location') || 'Add Location'}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
      </div>

      {/* Screen Indicator */}
      <div className="absolute top-2.5 right-5 bg-black bg-opacity-10 px-2 py-1 rounded-xl text-xs text-gray-600">
        Step 2/6
      </div>
    </div>
  );
}

export default AddHomeLocation;