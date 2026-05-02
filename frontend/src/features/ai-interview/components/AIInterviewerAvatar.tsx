import React from 'react';

type AvatarStatus = 'idle' | 'speaking' | 'listening' | 'recording' | 'processing';

interface AIInterviewerAvatarProps {
  status: AvatarStatus;
  questionText?: string;
  onReplayQuestion?: () => void;
  speechSupported?: boolean;
}

const statusLabelMap: Record<AvatarStatus, string> = {
  idle: 'Ready',
  speaking: 'Speaking question...',
  listening: 'Listening...',
  recording: 'Recording answer...',
  processing: 'Processing answer...',
};

export const AIInterviewerAvatar: React.FC<AIInterviewerAvatarProps> = ({
  status,
  questionText,
  speechSupported = true,
}) => {
  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening' || status === 'recording';
  const isProcessing = status === 'processing';

  return (
    <div className="relative flex flex-col items-center justify-center text-center text-white">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-44 w-44 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div className="absolute inset-2 rounded-full border border-white/8 bg-white/[0.03] backdrop-blur-md" />
          <div
            className={[
              'absolute inset-0 rounded-full border border-white/10 transition-transform duration-500',
              isSpeaking ? 'scale-110 bg-brand-400/10' : 'bg-white/[0.02]',
              isListening ? 'scale-105' : '',
            ].join(' ')}
          />
          <div className="absolute inset-[-10%] rounded-full border border-white/5" />

          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#dce8ff_38%,#7aa5ff_68%,#244387_100%)] shadow-[0_22px_90px_rgba(0,0,0,0.45)]">
            <div
              className={[
                'absolute inset-0 rounded-full border border-white/20 transition-transform duration-300',
                isSpeaking ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : '',
              ].join(' ')}
            />
            <div className="absolute left-7 top-9 h-3 w-3 rounded-full bg-ink-950" />
            <div className="absolute right-7 top-9 h-3 w-3 rounded-full bg-ink-950" />
            <div className="absolute top-[52px] h-2 w-10 rounded-full bg-brand-200/60" />
            <div
              className={[
                'absolute bottom-8 left-1/2 h-3 -translate-x-1/2 rounded-full bg-ink-950 transition-all duration-200',
                isSpeaking ? 'w-11 animate-[pulse_0.7s_ease-in-out_infinite]' : 'w-7',
              ].join(' ')}
            />
            <div className="absolute inset-3 rounded-full border border-white/35" />
          </div>

          {isListening ? (
            <div className="absolute inset-0 rounded-full border border-emerald-300/60 animate-ping" />
          ) : null}

          {isProcessing ? (
            <div className="absolute inset-0 rounded-full border-[3px] border-white/10 border-t-white/80 animate-spin" />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
              UniFreelance AI Interviewer
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Gravis</h2>
            <p className="text-sm text-white/60">
              {questionText
                ? 'I will ask the question, then listen while you answer naturally.'
                : 'Your interviewer is ready.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={[
                  'w-1.5 rounded-full transition-all duration-300',
                  isSpeaking
                    ? `h-8 bg-white/80 animate-[pulse_${0.6 + bar * 0.1}s_ease-in-out_infinite]`
                    : isListening
                      ? 'h-5 bg-emerald-300/95'
                      : isProcessing
                        ? 'h-4 bg-white/40'
                        : 'h-3 bg-white/25',
                ].join(' ')}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80">
              {statusLabelMap[status]}
            </span>
          </div>
        </div>

        {!speechSupported ? (
          <p className="text-xs text-amber-200">Voice playback unavailable on this browser.</p>
        ) : null}
      </div>
    </div>
  );
};
