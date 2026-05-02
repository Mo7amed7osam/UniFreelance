import React, { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

interface InterviewSetupProps {
  cameraStream: MediaStream | null;
  cameraReady: boolean;
  micReady: boolean;
  micLevel: number;
  screenReady: boolean;
  isStartingCamera: boolean;
  isStartingScreenShare: boolean;
  isTestingMicrophone: boolean;
  error?: string | null;
  onOpenCamera: () => Promise<unknown>;
  onShareScreen: () => Promise<unknown>;
  onTestMicrophone: () => Promise<unknown>;
  onEnterInterview: () => void;
}

const StatusPill = ({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) => (
  <span
    className={[
      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
      ready
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/30 dark:text-emerald-200'
        : 'border-ink-200 bg-ink-50 text-ink-600 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-300',
    ].join(' ')}
  >
    <span className={['h-2 w-2 rounded-full', ready ? 'bg-emerald-500' : 'bg-ink-400'].join(' ')} />
    {label}
  </span>
);

export const InterviewSetup: React.FC<InterviewSetupProps> = ({
  cameraStream,
  cameraReady,
  error,
  isStartingCamera,
  isStartingScreenShare,
  isTestingMicrophone,
  micLevel,
  micReady,
  onEnterInterview,
  onOpenCamera,
  onShareScreen,
  onTestMicrophone,
  screenReady,
}) => {
  const previewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    previewRef.current.srcObject = cameraStream;
    if (cameraStream) {
      previewRef.current.muted = true;
      void previewRef.current.play().catch(() => undefined);
    }
  }, [cameraStream]);

  const canEnterInterview = cameraReady && micReady && screenReady;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-ink-200 bg-white shadow-card dark:border-ink-700 dark:bg-ink-900/70">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                Pre-check
              </p>
              <h1 className="text-4xl font-semibold text-ink-900 dark:text-white">
                Set up your interview call before you enter.
              </h1>
              <p className="max-w-2xl text-sm text-ink-500 dark:text-ink-300">
                Open your camera, confirm your microphone, and share your entire screen once. Gravis
                will keep the same session active across the whole interview.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusPill label="Camera ready" ready={cameraReady} />
              <StatusPill label="Microphone ready" ready={micReady} />
              <StatusPill label="Entire screen shared" ready={screenReady} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void onOpenCamera()}
                disabled={isStartingCamera || cameraReady}
                className="justify-between"
              >
                <span>{isStartingCamera ? 'Opening camera...' : cameraReady ? 'Camera ready' : 'Open camera'}</span>
                <span className="text-xs text-white/70">{cameraReady ? 'Done' : 'Step 1'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => void onTestMicrophone()}
                disabled={isTestingMicrophone}
                className="justify-between"
              >
                <span>
                  {isTestingMicrophone
                    ? 'Testing microphone...'
                    : micReady
                      ? 'Microphone ready'
                      : 'Test microphone'}
                </span>
                <span className="text-xs text-white/70">{micReady ? 'Done' : 'Step 2'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => void onShareScreen()}
                disabled={isStartingScreenShare || screenReady}
                className="justify-between sm:col-span-2"
              >
                <span>
                  {isStartingScreenShare
                    ? 'Sharing entire screen...'
                    : screenReady
                      ? 'Entire screen ready'
                      : 'Share entire screen'}
                </span>
                <span className="text-xs text-white/70">{screenReady ? 'Done' : 'Step 3'}</span>
              </Button>
            </div>

            <div className="space-y-3 rounded-2xl border border-ink-100 bg-ink-50/80 p-4 dark:border-ink-700 dark:bg-ink-800/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">Microphone activity</p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    Speak normally and confirm the meter responds.
                  </p>
                </div>
                <span className="text-xs font-medium text-ink-500 dark:text-ink-400">
                  {micReady ? 'Ready' : 'Waiting'}
                </span>
              </div>

              <div className="flex items-end gap-1">
                {Array.from({ length: 18 }).map((_, index) => {
                  const threshold = (index + 1) / 18;
                  const active = micLevel >= threshold;
                  return (
                    <span
                      key={index}
                      className={[
                        'w-full rounded-full transition-all duration-150',
                        active ? 'bg-emerald-500' : 'bg-ink-200 dark:bg-ink-700',
                      ].join(' ')}
                      style={{ height: `${12 + (index % 6) * 6}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                {error}
              </p>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-ink-200 bg-ink-950 shadow-soft dark:border-ink-700">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white/80">
                <span className="text-sm font-medium">Camera preview</span>
                <span className="text-xs">{cameraReady ? 'Live' : 'Waiting for camera'}</span>
              </div>
              <div className="aspect-[4/5] bg-ink-950">
                <video
                  ref={previewRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-ink-50 p-6 dark:border-brand-900/40 dark:from-brand-950/20 dark:via-ink-900 dark:to-ink-800">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                Before you enter
              </p>
              <ul className="mt-4 space-y-3 text-sm text-ink-600 dark:text-ink-300">
                <li>Keep your face clearly visible in the camera frame.</li>
                <li>Share your entire screen, not a window or tab.</li>
                <li>Once you enter, Gravis will keep this setup active for every question.</li>
              </ul>

              <Button
                type="button"
                className="mt-6 w-full"
                onClick={onEnterInterview}
                disabled={!canEnterInterview}
              >
                Enter interview
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
