import React from 'react';
import { useTranslation } from 'react-i18next';

const EventExpired = () => {
    const { t }: any = useTranslation();

    return (
        <main className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    ❌{t('EventExpired.error_title')}
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                    😕{t('EventExpired.expired_message')}
                </p>
                <p className="text-gray-500 text-sm">
                    {t('EventExpired.apology_message')}
                </p>
            </div>
        </main>
    );
};

export default EventExpired;