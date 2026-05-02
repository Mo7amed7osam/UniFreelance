import React, { useEffect, useRef } from 'react';

interface CameraRecorderProps {
  cameraStream: MediaStream | null;
  isRecording: boolean;
  statusText?: string;
  error?: string | null;
}

export const CameraRecorder: React.FC<CameraRecorderProps> = ({
  cameraStream,
  isRecording,
  statusText,
  error,
}) => {
  const previewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!previewRef.current) return;

    previewRef.current.src = '';
    previewRef.current.srcObject = cameraStream;
    if (cameraStream) {
      previewRef.current.muted = true;
      void previewRef.current.play().catch(() => undefined);
    }
  }, [cameraStream]);

  return (
    <div className="pointer-events-none w-full max-w-[14rem] rounded-[1.4rem] border border-white/8 bg-black/55 p-2 shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="overflow-hidden rounded-[1rem] border border-white/8 bg-black">
        <video
          ref={previewRef}
          className="aspect-[4/5] w-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>

      <div className="space-y-1 px-1.5 pb-0.5 pt-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">You</p>
          <span
            className={[
              'h-2.5 w-2.5 rounded-full transition-colors',
              isRecording ? 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.95)]' : 'bg-emerald-400',
            ].join(' ')}
          />
        </div>

        <p className="text-xs text-white/62">
          {statusText || 'Camera stays live during the interview.'}
        </p>

        {error ? <p className="text-[11px] text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
};
