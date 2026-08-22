import { IoDocumentTextOutline } from 'react-icons/io5';
import { Markdown } from '../common/Markdown';
import type { UIMessage, TextPart, ImagePart, FilePart } from '../../types';

interface MessageContentProps {
  message: UIMessage;
  variant: 'user' | 'assistant';
}

export function MessageContent({ message, variant }: MessageContentProps) {
  const parts = message.parts || [];
  const partsToRender = Array.isArray(parts) && parts.length > 0 ? parts : [];

  if (partsToRender.length === 0) {
    return null;
  }

  return (
    <>
      {partsToRender.map((part, idx) => {
        // Text part
        if (part.type === 'text') {
          const textPart = part as TextPart;
          return variant === 'user' ? (
            <div key={idx} className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {textPart.text}
            </div>
          ) : (
            <div key={idx} className="prose max-w-none">
              <Markdown>{textPart.text}</Markdown>
            </div>
          );
        }

        // Image part
        if (part.type === 'image') {
          const imagePart = part as ImagePart;
          const imageUrl =
            typeof imagePart.image === 'string'
              ? imagePart.image
              : imagePart.url || (imagePart.image instanceof URL ? imagePart.image.toString() : '');

          return (
            <div key={idx} className={variant === 'assistant' ? 'my-3' : ''}>
              <img
                src={imageUrl}
                alt={variant === 'user' ? 'Uploaded image' : 'AI-provided image'}
                className={
                  variant === 'user'
                    ? 'max-w-full sm:max-w-sm rounded-xl border border-primary/30 cursor-pointer hover:opacity-90 transition-opacity'
                    : 'max-w-full max-h-96 rounded-xl border border-border cursor-pointer hover:opacity-90 transition-opacity'
                }
                onClick={() => window.open(imageUrl, '_blank')}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23333" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="14"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                  e.currentTarget.classList.add('opacity-50', 'cursor-not-allowed');
                }}
              />
            </div>
          );
        }

        // File part
        if (part.type === 'file') {
          const filePart = part as FilePart;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-3 max-w-full sm:max-w-sm"
            >
              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                <IoDocumentTextOutline className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate" title={filePart.text}>
                  {filePart.text}
                </p>
                <p className="text-xs text-foreground/60 uppercase">{filePart.fileType || 'DOC'}</p>
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
