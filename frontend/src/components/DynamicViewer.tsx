import React from 'react';
import { uploadService } from '../services/wordService';
import { determineContentType } from '../utils/typeDetector';

interface DynamicViewerProps {
  value: string;
  label?: string;
  className?: string;
}

const DynamicViewer: React.FC<DynamicViewerProps> = ({
  value,
  label,
  className = '',
}) => {
  if (!value) {
    return (
      <div className={`text-gray-400 italic ${className}`}>
        {label ? `No ${label} provided` : 'No content'}
      </div>
    );
  }

  // Determine content type
  const contentType = determineContentType(value);
  const isAudio = contentType === 'audio';
  const isImage = contentType === 'image';

  // Audio content
  if (isAudio) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
        <audio
          src={uploadService.getFileUrl(value)}
          controls
          className="w-full h-10 rounded-lg border border-gray-200"
        />
      </div>
    );
  }

  // Image content
  if (isImage) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
        <img
          src={uploadService.getFileUrl(value)}
          alt={label || 'Content'}
          className="max-h-64 max-w-full rounded-lg border border-gray-200 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).className += ' hidden';
          }}
        />
      </div>
    );
  }

  // Text content (default)
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 break-words whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
};

export default DynamicViewer;
