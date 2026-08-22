import { IoCloseOutline, IoDocumentTextOutline } from 'react-icons/io5';
import type { Attachment } from '@/types';
import { formatFileSize } from '../../services/upload.service';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
  const { id, file, previewUrl, status, progress, error } = attachment;
  const isImage = file.type.startsWith('image/');

  return (
    <div className="relative inline-flex items-center gap-3 bg-surface border border-border rounded-xl p-3 w-full sm:w-auto sm:min-w-[200px]">
      {/* Thumbnail or Icon */}
      <div className="relative flex-shrink-0 w-16 h-16 bg-border rounded border border-border flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <IoDocumentTextOutline className="w-8 h-8 text-foreground/40" />
        )}

        {/* Upload progress overlay */}
        {status === 'uploading' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-xs text-white font-medium">{progress}%</div>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/90 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-foreground/60">
          {formatFileSize(file.size)}
        </p>
        {/* Status messages */}
        {status === 'uploading' && (
          <p className="text-xs text-blue-400 mt-1">Uploading...</p>
        )}
        {status === 'uploaded' && (
          <p className="text-xs text-green-500 mt-1">✓ Uploaded</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-500 mt-1">{error || 'Upload failed'}</p>
        )}
      </div>

      {/* Remove button */}
      {status !== 'uploading' && (
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="absolute top-2 right-2 text-foreground/40 hover:text-red-500 transition-colors cursor-pointer"
          title="Remove attachment"
        >
          <IoCloseOutline className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
