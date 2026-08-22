import { useState, useRef, useEffect, useCallback } from 'react';
import type { Attachment } from '../../types';
import { validateFile, uploadAttachment } from '../../services/upload.service';
import { toast } from '../../utils/toast';

const MAX_ATTACHMENTS = 5;

export function useChatAttachments(conversationId?: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Keep a live ref of attachments for unmount cleanup
  const attachmentsRef = useRef<Attachment[]>([]);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((att) => URL.revokeObjectURL(att.previewUrl));
    };
  }, []);

  const handleAttachmentAdd = useCallback(
    async (file: File) => {
      if (!conversationId) {
        toast.error('Please create a conversation first before uploading files');
        return;
      }

      if (attachments.length >= MAX_ATTACHMENTS) {
        toast.error(`Maximum ${MAX_ATTACHMENTS} files per message`);
        return;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      const attachment: Attachment = {
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
        progress: 0,
        type: file.type.startsWith('image/') ? 'image' : 'file',
      };

      setAttachments((prev) => [...prev, attachment]);
      setIsUploading(true);

      try {
        const { url: uploadedUrl, attachmentId } = await uploadAttachment(
          file,
          conversationId,
          (progress) => {
            setAttachments((prev) =>
              prev.map((att) => (att.id === attachment.id ? { ...att, progress } : att))
            );
          }
        );

        setAttachments((prev) =>
          prev.map((att) =>
            att.id === attachment.id
              ? { ...att, uploadedUrl, attachmentId, status: 'uploaded' as const }
              : att
          )
        );
        toast.success('File uploaded successfully');
      } catch (error) {
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === attachment.id
              ? {
                  ...att,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : att
          )
        );
        toast.error('Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    },
    [conversationId, attachments.length]
  );

  const handleAttachmentRemove = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((att) => att.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((att) => att.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    attachments.forEach((att) => URL.revokeObjectURL(att.previewUrl));
    setAttachments([]);
  }, [attachments]);

  return {
    attachments,
    setAttachments,
    isUploading,
    handleAttachmentAdd,
    handleAttachmentRemove,
    clearAttachments,
    hasUploadingAttachments: attachments.some((att) => att.status === 'uploading'),
    hasFailedAttachments: attachments.some((att) => att.status === 'error'),
  };
}
