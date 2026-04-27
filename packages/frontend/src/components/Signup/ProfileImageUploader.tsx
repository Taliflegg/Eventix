import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CameraIcon } from '@heroicons/react/24/outline';

interface ProfileImageUploaderProps {
  imageBase64: string | null;
  onImageChange: (base64: string | null, file?: File | null) => void;
}

const defaultProfileImage =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export function ProfileImageUploader({
  imageBase64,
  onImageChange,
}: ProfileImageUploaderProps) {
   const { t }: { t: (key: string) => string } = useTranslation();
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(reader.result as string, file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const onDeleteImage = () => {
    onImageChange(null, null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => inputFileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative w-24 h-24 rounded-full border-2 ${isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
          } cursor-pointer flex items-center justify-center overflow-hidden`}
        title={t("signupForm.imageUploader.uploadTooltip")}
      >
        <img
          src={imageBase64 || defaultProfileImage}
          alt={t("signupForm.imageUploader.altText")}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow">
            {/* Change plus to camera icon */}
            <CameraIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {imageBase64 && (
        <button
          className="text-sm text-red-600 hover:underline"
          onClick={onDeleteImage}
        >
          🗑️ {t("signupForm.imageUploader.deleteButton")}
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputFileRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
