import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EventTemplate } from './eventTemplates';
import { useEffect } from 'react';
import axios  from 'axios';
import eventService from '../services/eventsService';

// אפשרות חלופית - שימוש בטקסט במקום אייקונים אם יש בעיה עם החבילה
const CalendarIcon = () => <span className="inline-block mr-1 text-green-600">📅</span>;
const MapIcon = () => <span className="inline-block mr-1 text-green-600">📍</span>;
const LanguageIcon = () => <span className="inline-block mr-1 text-green-600">🌐</span>;
const UtensilsIcon = () => <span className="inline-block mr-1 text-green-600">🍽️</span>;
const UsersIcon = () => <span className="inline-block mr-1 text-green-600">👥</span>;
const ImageIcon = () => <span className="inline-block mr-1 text-green-600">🖼️</span>;
const CloseIcon = () => <span className="inline-block">✖️</span>;


const ImageIconLarge = () => <span className="inline-block w-6 h-6 text-gray-400">🖼️</span>;



type MealType = 'meat' | 'dairy' | 'vegetarian' | 'vegan' | 'kosher' | 'bbq' | 'other';

// Interface for form data
interface FormData {
  title: string;
  description?: string;
  location: string;
  datetime: string; // string format for the input
  language: 'en' | 'he';
  mealType: MealType;
  expectedCount: number;
  isLimited: boolean; // Note: different case than in Event interface
  thumbnail?: string | File | null;
}

// // Interface for the Event type that matches the expected structure
// interface EventData {
//   title: string;
//   description: string;
//   location: string;
//   datetime: Date;
//   language: 'en' | 'he';
//   mealType: MealType;
//   expectedCount: number;
//   isLimited: boolean;
//   thumbnail?: string | File | null;
//   // createdBy?: string;
//   updatedAt?: Date;
// }

const getNowForInput = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
};

// Helper function to initialize form data
const initFormData = (): FormData => {
  return {
    title: '',
    description: '',
    location: '',
    datetime: getNowForInput(),
    language: 'he', // Default to Hebrew
    expectedCount: 0,
    mealType: 'meat',
    isLimited: false,
    thumbnail: ''
  };
};

interface FormProps {
  onClose: () => void;
  onSuccess?: () => void;
  templateData?: Partial<EventTemplate>; //j ai ajouté cette ligne pour permettre l'utilisation de données de modèle/optionel
}



const Form: React.FC<FormProps> = ({ onClose, onSuccess, templateData }) => {
  const { t }: { t: (key: string) => string } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data using the helper function
  const [formData, setFormData] = useState<FormData>(initFormData());



  const isValidLanguage = (lang: any): lang is 'en' | 'he' => ['en', 'he'].includes(lang);
  const mealTypes: MealType[] = ['meat', 'dairy', 'vegetarian', 'vegan', 'kosher', 'bbq', 'other'];

  const isMealType = (value: any): value is MealType => mealTypes.includes(value);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    debugger
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({
      ...formData,
      thumbnail: file  // ← שומר את הקובץ עצמו
    });
  };
  const toggleLanguage = () => {
    setFormData({
      ...formData,
      language: formData.language === 'he' ? 'en' : 'he'
    });
  };
  useEffect(() => {
    if (templateData) {
      const rawDatetime = templateData.datetime;
      const formattedDatetime =
        rawDatetime && !isNaN(Date.parse(rawDatetime))
          ? new Date(rawDatetime).toISOString().slice(0, 16)
          : getNowForInput();

      setFormData(prevData => ({
        ...prevData,
        ...templateData,
        language: isValidLanguage(templateData.language) ? templateData.language : 'he',
        mealType: isMealType(templateData.mealType) ? templateData.mealType : 'meat',
        datetime: formattedDatetime,
      }));
    } else {
      setFormData(initFormData());
    }
  }, [templateData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? Number(value) : value
      });
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    debugger
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('location', formData.location);
      formDataToSend.append('datetime', new Date(formData.datetime).toISOString());
      formDataToSend.append('language', formData.language);
      formDataToSend.append('mealType', formData.mealType);
      formDataToSend.append('expectedCount', String(formData.expectedCount));
      formDataToSend.append('isLimited', String(formData.isLimited));

      if (formData.thumbnail instanceof File) {
        formDataToSend.append('thumbnail', formData.thumbnail); // ← חובה שהשם יתאים ל־upload.single('thumbnail')
      }
   

     const response =await eventService.createEvent(formDataToSend);
      toast.success(t('EditEvent.create event'), {
        position: 'top-center',
        autoClose: 2500,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      let errorMessage = t('EditEvent.error') || 'Error creating event';
      if (error.response) {
        errorMessage += ` (${error.response.status}): ${error.response.data?.message || 'Server error'}`;
      } else if (error.request) {
        errorMessage += ': No response from server';
      } else {
        errorMessage += `: ${error.message}`;
      }

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white text-black rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all border border-green-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-3 px-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold">{t('EditEvent.create event')}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none transition-transform transform hover:scale-110"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Row 1: Title and Location */}
            <div className="grid grid-cols-2 gap-3">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-green-700 mb-1">
                  {t('EditEvent.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t('EditEvent.title')}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-green-700 mb-1 flex items-center">
                  <MapIcon />
                  {t('EditEvent.location')}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('EditEvent.location')}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-green-700 mb-1">
                {t('EditEvent.description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={formData.description || ''}
                onChange={handleChange}
                placeholder={t('EditEvent.description')}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black transition-colors resize-none"
              />
            </div>

            {/* Row 3: Datetime and Meal Type */}
            <div className="grid grid-cols-2 gap-3">
              {/* Datetime */}
              <div>
                <label htmlFor="datetime" className="block text-sm font-medium text-green-700 mb-1 flex items-center">
                  <CalendarIcon />
                  {t('EditEvent.date')} {t('EditEvent.time')}
                </label>
                <input
                  type="datetime-local"
                  id="datetime"
                  name="datetime"
                  required
                  value={formData.datetime}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black transition-colors"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label htmlFor="mealType" className="block text-sm font-medium text-green-700 mb-1 flex items-center">
                  <UtensilsIcon />
                  {t('EditEvent.meal type')}
                </label>
                <select
                  id="mealType"
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black transition-colors appearance-none"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%2316a34a\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', paddingRight: '2rem' }}
                >
                  <option value="kosher">{t('EditEvent.meal types.kosher')}</option>
                  <option value="meat">{t('EditEvent.meal types.meat')}</option>
                  <option value="dairy">{t('EditEvent.meal types.dairy')}</option>
                  <option value="vegetarian">{t('EditEvent.meal types.vegetarian')}</option>
                  <option value="vegan">{t('EditEvent.meal types.vegan')}</option>
                  <option value="bbq">{t('EditEvent.meal types.bbq')}</option>
                  <option value="other">{t('EditEvent.meal types.other')}</option>
                </select>
              </div>
            </div>

            {/* Row 4: Expected Count, Language and Is Limited */}
            <div className="grid grid-cols-3 gap-3">
              {/* Expected Count */}
              <div>
                <label htmlFor="expectedCount" className="block text-sm font-medium text-green-700 mb-1 flex items-center">
                  <UsersIcon />
                  {t('EditEvent.expected count')}
                </label>
                <input
                  type="number"
                  id="expectedCount"
                  name="expectedCount"
                  required
                  min={1}
                  value={formData.expectedCount}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black transition-colors"
                />
              </div>

              {/* Language Switch */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1 flex items-center">
                  <LanguageIcon />
                  {t('EditEvent.language')}
                </label>
                <div className="flex items-center h-8 mt-1">
                  <span className={`mr-2 ${formData.language === 'he' ? 'font-bold text-green-700' : 'text-gray-600'}`}>עברית</span>
                  <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="language-toggle"
                      name="language-toggle"
                      checked={formData.language === 'en'}
                      onChange={toggleLanguage}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                      style={{
                        right: formData.language === 'en' ? '0' : '6px',
                        transition: 'right 0.2s'
                      }}
                    />
                    <label
                      htmlFor="language-toggle"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.language === 'en' ? 'bg-green-600' : 'bg-gray-300'}`}
                      onClick={toggleLanguage}
                    ></label>
                  </div>
                  <span className={`ml-2 ${formData.language === 'en' ? 'font-bold text-green-700' : 'text-gray-600'}`}>English</span>
                </div>
              </div>

              {/* Is Limited */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  {t('EditEvent.is limited')}
                </label>
                <div className="flex items-center h-8 mt-1">
                  <span className={`mr-2 ${!formData.isLimited ? 'font-bold text-green-700' : 'text-gray-600'}`}>{t('EditEvent.no')}</span>
                  <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="isLimited"
                      name="isLimited"
                      checked={formData.isLimited}
                      onChange={handleChange}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                      style={{
                        right: formData.isLimited ? '0' : '6px',
                        transition: 'right 0.2s'
                      }}
                    />
                    <label
                      htmlFor="islimited"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.isLimited ? 'bg-green-600' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                  <span className={`ml-2 ${formData.isLimited ? 'font-bold text-green-700' : 'text-gray-600'}`}>{t('EditEvent.yes')}</span>
                </div>
              </div>
            </div>

            {/* Row 5: Image and Submit Button */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Image */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-green-700 mb-1 flex items-center">
                  <ImageIcon />
                  {t('EditEvent.image')}
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="thumbnail"
                    className="cursor-pointer flex items-center"
                  >

                    {formData.thumbnail ? (
                      <div className="flex items-center">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 shadow-lg">

                          <img
                            src={
                              formData.thumbnail instanceof File
                                ? URL.createObjectURL(formData.thumbnail)
                                : formData.thumbnail || ''
                            }
                            alt="תצוגה מקדימה"
                            className="w-full h-full object-cover"
                          />
                        </div>

                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
                          <ImageIconLarge />
                        </div>

                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex items-end justify-end h-full gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  {t('EditEvent.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('EditEvent.saving')}
                    </div>
                  ) : (
                    t('EditEvent.create event')
                  )}
                </button>
              </div>
            </div>
          </form>
        </div >
      </div >

      {/* CSS for toggle switches */}
      <style > {`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #16a34a;
        }
        .toggle-label {
          transition: background-color 0.2s;
        }
      `}</style>
    </div >
  );
};

export default Form;