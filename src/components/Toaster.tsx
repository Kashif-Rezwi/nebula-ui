import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      toastOptions={{
        style: {
          background: '#262626',
          color: '#f5f5f5',
          border: '1px solid #2a2a2a',
        },
        className: 'sonner-toast',
      }}
    />
  );
}