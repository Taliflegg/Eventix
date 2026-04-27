import React, { useState } from 'react';
import { eventTemplates, EventTemplateType } from './eventTemplates';
import { useTranslation } from 'react-i18next';




interface Props {
    open: boolean;
    onClose: () => void;
    onSelectTemplate: (template: typeof eventTemplates[EventTemplateType]) => void;
    onSelectClassic: () => void;
}


const EventCreateModeDialog: React.FC<Props> = ({ open, onClose, onSelectTemplate, onSelectClassic }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<EventTemplateType | ''>('');
    const [showPreview, setShowPreview] = useState(false);
    const { t }: { t: (key: string) => string } = useTranslation();


    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 min-w-[320px] max-w-full">
                <h2 className="text-xl font-bold mb-4">{t('Template.create_event')}</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-4 w-full"
                    onClick={onSelectClassic}
                >
                    {t('Template.to_create_event')}
                </button>
                <div className="mb-2 font-semibold">{t('Template.choose_template')}</div>
                <select
                    className="border rounded px-2 py-1 w-full"
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value as EventTemplateType)}
                >
                    <option value="">{t('Template.choose')}</option>
                    <option value="party">{t('Template.party')}</option>
                    <option value="birth">{t('Template.birthday')}</option>
                    <option value="army">{t('Template.army')}</option>
                    {/* <option value="chabat">{t('Template.chabat')}</option> */}
                </select>

                {selectedTemplate && (
                    <>
                        <button
                            className="mt-4 mb-2 bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600 transition"
                            onClick={() => setShowPreview(prev => !prev)}
                        >
                            {showPreview ? t('Template.hide_a_peek') : t('Template.peek')}
                        </button>

                        {showPreview && (
                            <div className="bg-gray-50 border border-green-400 rounded-lg p-4 shadow-inner text-sm leading-relaxed space-y-1 animate-fade-in">
                                <div><span className="font-semibold text-green-700">כותרת:</span> {eventTemplates[selectedTemplate].title}</div>
                                <div><span className="font-semibold text-green-700">תיאור:</span> {eventTemplates[selectedTemplate].description}</div>
                                <div><span className="font-semibold text-green-700">מיקום:</span> {eventTemplates[selectedTemplate].location}</div>
                                <div><span className="font-semibold text-green-700">תאריך:</span> {new Date(eventTemplates[selectedTemplate].datetime).toLocaleString('he-IL')}</div>
                                <div><span className="font-semibold text-green-700">שפה:</span> {eventTemplates[selectedTemplate].language === 'he' ? 'עברית' : 'English'}</div>
                                <div><span className="font-semibold text-green-700">סוג ארוחה:</span> {eventTemplates[selectedTemplate].mealType}</div>
                                <div><span className="font-semibold text-green-700">כמות משתתפים:</span> {eventTemplates[selectedTemplate].expectedCount}</div>
                                <div><span className="font-semibold text-green-700">האם מוגבל?</span> {eventTemplates[selectedTemplate].isLimited ? 'כן' : 'לא'}</div>
                            </div>
                        )}

                        <button
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 transition"
                            onClick={() => onSelectTemplate(eventTemplates[selectedTemplate])}
                        >
                            {t('Template.template_choosen')}
                        </button>
                    </>
                )}

                <button
                    className="mt-4 text-gray-500 underline w-full"
                    onClick={onClose}
                >
                    {t('Template.cancel')}
                </button>
            </div>
        </div>
    );
};

<style>
    {`
  .animate-fade-in {
    animation: fadeIn 0.4s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`}
</style>


export default EventCreateModeDialog;