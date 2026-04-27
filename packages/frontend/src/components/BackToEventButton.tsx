import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";

interface BackToEventButtonProps {
    onClick: () => void;
}

const BackToEventButton: React.FC<BackToEventButtonProps> = ({ onClick }) => {
    const { t }: { t: (key: string) => string } = useTranslation();
    const isRTL = i18n.language === 'he';

    return (
        <button 
            className="bg-[#28A745] hover:bg-[#218838] text-white font-bold py-2 px-4 rounded m-4 flex items-center gap-2"
            onClick={onClick}
        >
            {isRTL ? (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="hidden sm:inline">{t("backToEvent.buttonText")}</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">{t("backToEvent.buttonText")}</span>
                </>
            )}
        </button>
    );
};

export default BackToEventButton; 