import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocationsByUserId } from '../../services/accountService';
import { getCurrentUserAccountId } from '../../services/usersService';
import { Location } from '@eventix/shared/src';
import { toast } from 'react-toastify';

const ShareLocationFirst: React.FC = () => {
    const { t }: { t: (key: string) => string } = useTranslation();
    const [step, setStep] = useState(0);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [accountId, setAccountId] = useState<string>('');
    const navigate = useNavigate();
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const locs = await getLocationsByUserId();
                setLocations(Array.isArray(locs) ? locs : []);
                if (locs.length > 0) setSelectedLocation(locs[0].id);

                const response = await getCurrentUserAccountId();
                if (response.data?.accountId) {
                    setAccountId(response.data.accountId);
                } else {
                    console.warn('Account ID not found in response');
                }
            } catch (error) {
                console.error(t('ShareLocationFirst.load_error'), error);
            }
        };

        fetchData();
    }, []);

    const next = () => {
        if (!selectedLocation) {
            toast.error(t('ShareLocationFirst.no_location_alert'));
            return;
        }
        setStep((s) => s + 1);
    };

    const back = () => setStep((s) => Math.max(0, s - 1));

    const locationName = locations.find((loc) => loc.id === selectedLocation)?.name || '';

   const shareUrl =
        accountId && selectedLocation
            // ? `${window.location.origin}/shareLocationFriends?account_id=${accountId}&location_id=${selectedLocation}`
            ? `${frontendUrl}/shareLocationFriends?account_id=${accountId}&location_id=${selectedLocation}`
            : '';

    const copyToClipboard = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            toast.success(t('ShareLocationFirst.copy_success'));
        }
    };

    const shareWhatsapp = () => {
        if (shareUrl) {
            const text = `${t('ShareLocationFirst.whatsapp_text')} ${shareUrl}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
            <header className="bg-white px-5 py-3 border-b sticky top-0 z-10">
                <div className="flex items-center">
                    {step > 0 ? (
                        <button onClick={back} className="text-blue-600 text-2xl font-bold mr-5 rtl:rotate-180">←</button>
                    ) : (
                        <button onClick={() => navigate('/shabbat-profile')} className="text-blue-600 text-2xl font-bold mr-5 rtl:rotate-180">←</button>
                    )}
                    <h1 className="text-lg font-semibold text-gray-800 flex-1">
                        {t(`ShareLocationFirst.step_${step + 1}_title`)}
                    </h1>
                </div>

                <div className="bg-red-100 text-xs text-gray-700 px-2 py-1 ">
                    {t('ShareLocationFirst.step_indicator')} {step + 1}/2
                </div>
            </header>


            <main className="flex-1 px-5 w-full overflow-auto space-y-6 pt-0 mt-0">
                {step === 0 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <div className="text-lg font-semibold">{t('ShareLocationFirst.choose_location_title')}</div>
                            <div className="text-sm text-gray-600">{t('ShareLocationFirst.choose_location_subtitle')}</div>
                        </div>

                        <div className="px-5 py-3 space-y-3">
                            {locations.map((loc) => {
                                const locKey = loc.id;
                                return (
                                    <div
                                        key={locKey}
                                        onClick={() => setSelectedLocation(locKey)}
                                        className={`flex items-center justify-between border-b last:border-b-0 py-2 cursor-pointer ${selectedLocation === locKey ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getIconBg(loc.location_type)} ${getIconColor(loc.location_type)}`}>
                                                {getIcon(loc.location_type)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">{loc.name}</div>
                                                <div className="text-xs text-gray-600">{loc.address}</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLocation === locKey ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {selectedLocation === locKey && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={next} className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg font-semibold">
                            {t('ShareLocationFirst.continue_button')}
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden space-y-4">
                        <div className="border-b px-5 py-4">
                            <div className="text-lg font-semibold">{t('ShareLocationFirst.share_created_title')}</div>
                            <div className="text-sm text-gray-600">{t('ShareLocationFirst.share_created_subtitle')}</div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <div className="font-semibold mb-2">
                                {`${t('ShareLocationFirst.sharing_label')} ${locationName}`}
                            </div>
                            <div className="font-mono text-xs text-gray-600 bg-white p-2 rounded break-words cursor-pointer mb-4" onClick={copyToClipboard}>
                                {shareUrl}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button onClick={shareWhatsapp} className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                                    {t('ShareLocationFirst.whatsapp_button')}
                                </button>
                                <button onClick={copyToClipboard} className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 transition">
                                    {t('ShareLocationFirst.copy_button')}
                                </button>
                            </div>
                        </div>

                        <button onClick={() => navigate('/shabbat-profile')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                            {t('ShareLocationFirst.back_profile_button')}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

const getIcon = (location_type: string) => {
    switch (location_type) {
        case 'home': return '🏠';
        case 'parents': return '👨‍👩‍👧‍👦';
        case 'inlaws': return '👰';
        case 'friends': return '👥';
        default: return '📍';
    }
};

const getIconBg = (location_type: string) => {
    switch (location_type) {
        case 'home': return 'bg-blue-100';
        case 'parents': return 'bg-orange-100';
        case 'inlaws': return 'bg-purple-100';
        case 'friends': return 'bg-green-100';
        default: return 'bg-gray-100';
    }
};

const getIconColor = (location_type: string) => {
    switch (location_type) {
        case 'home': return 'text-blue-700';
        case 'parents': return 'text-orange-700';
        case 'inlaws': return 'text-purple-700';
        case 'friends': return 'text-green-700';
        default: return 'text-gray-500';
    }
};

export default ShareLocationFirst;
