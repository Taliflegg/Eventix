import React, { useState } from "react";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { EventDetailsView } from "@eventix/shared";
import { FaWhatsapp } from "react-icons/fa";
import type { FC } from "react";
type EventSharedViewProps = {
  event: EventDetailsView,
  token: string;
};
function EventSharedView({ event, token }: EventSharedViewProps) {
  const [copied, setCopied] = useState(false);
  const { title, datetime, location, DietaryRestriction, joinedCount } = event;
  const { t }: { t: (key: string) => string } = useTranslation();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
  // const BASE_URL = `${frontendUrl}/share`;
  // const fullUrl = `${BASE_URL}?token=${token}`;
  const BASE_URL = `${frontendUrl}/share`;
  const fullUrl = `${BASE_URL}/${token}`;
  const FaWhatsappIcon = FaWhatsapp as unknown as FC<{ className?: string }>;
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("שגיאה בהעתקה", err);
    }
  };
  const date = new Date(datetime);
  const formattedDate = date.toLocaleDateString("he-IL");
  const formattedTime = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const message = `היי! ראיתי אירוע שיכול לעניין אותך :partying_face:\n\n${fullUrl}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
  return (
    <>
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-1">:watch:  {formattedDate} |  {formattedTime}</p>
        <p className="text-sm text-gray-500 mb-3"> :round_pushpin:  {location}</p>
        {DietaryRestriction?.length > 0 && (
          <p className="text-gray-700 mb-4">
            <span className="font-bold"> :fork_and_knife: {t('EventSharedView.dietary')}:</span>
            {DietaryRestriction.join(" | ")}
          </p>
        )}
        <p className="text-gray-700 mb-4">
          <span className="font-bold"> :busts_in_silhouette: {t('EventSharedView.participants')}: </span>
          {joinedCount}
        </p>
        <div className="bg-gray-100 px-3 py-2 rounded-lg flex items-center justify-between gap-2">
          <span className="text-sm text-gray-700 max-w-[10000px] overflow-hidden whitespace-nowrap truncate">
            {fullUrl}
          </span>
          <button onClick={handleShare} title="העתק קישור">
            <Square2StackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 transition" />
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            title="שתף בוואטסאפ"
          >
            <FaWhatsappIcon className="h-5 w-5 text-green-500 hover:text-green-700 transition" />
          </a>
        </div>
      </div>
      {copied && (
        <div className="fixed bottom-4 right-4 bg-white text-600 text-sm px-4 py-2 rounded shadow-lg z-50">
          הקישור הועתק
        </div>
      )}
    </>
  );
}

export default EventSharedView;
