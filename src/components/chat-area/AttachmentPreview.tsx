import { IoDocumentTextOutline } from 'react-icons/io5';
import type { Attachment } from '@/types';
import { formatFileSize } from '@/lib/upload';

interface AttachmentPreviewProps {
    attachment: Attachment;
    onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
    const { id, file, previewUrl, status, progress, error } = attachment;
    const isImage = file.type.startsWith('image/');

    return (
        <div className="relative inline-flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 min-w-[200px]">
            {/* Thumbnail or Icon */}
            <div className="relative flex-shrink-0 w-16 h-16 bg-[#2a2a2a] rounded border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
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
                <p className="text-sm text-white truncate" title={file.name}>
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
                    <p className="text-xs text-green-400 mt-1">✓ Uploaded</p>
                )}
                {status === 'error' && (
                    <p className="text-xs text-red-400 mt-1">{error || 'Upload failed'}</p>
                )}
            </div>

            {/* Remove button */}
            {status !== 'uploading' && (
                <button
                    onClick={() => onRemove(id)}
                    className="absolute top-2 right-2 text-foreground/40 hover:text-red-400 transition-colors"
                    title="Remove attachment"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
