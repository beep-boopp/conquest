import { ENGLAND_MIKU_IMAGE, MIKU_TIMELINE, MikuCustodyStep } from "@/lib/miku-content";

function StepCard({ step }: { step: MikuCustodyStep }) {
  return (
    <div className="flex w-40 shrink-0 flex-col items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-center">
      {step.hasArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ENGLAND_MIKU_IMAGE} alt={step.country} className="h-16 w-16 rounded object-cover object-top" />
      ) : (
        <div className="text-3xl">{step.flag}</div>
      )}
      <div className="text-sm font-medium text-neutral-100">
        {step.flag} {step.country}
      </div>
      <div className="text-xs text-neutral-500">{step.resultLabel}</div>
      <div className="text-xs italic text-neutral-400">{step.quip}</div>
    </div>
  );
}

function PendingStepCard() {
  return (
    <div className="flex w-40 shrink-0 flex-col items-center gap-1 rounded-lg border border-dashed border-neutral-700 p-3 text-center text-neutral-500">
      <div className="text-3xl">❓</div>
      <div className="text-sm font-medium">Tonight...</div>
      <div className="text-xs">England vs Argentina</div>
      <div className="text-xs italic">Who will Miku become?</div>
    </div>
  );
}

export function MikuTimelinePanel({ todayStep }: { todayStep: MikuCustodyStep | null }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 text-sm font-medium text-neutral-200">Miku&apos;s World Cup Journey</div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {MIKU_TIMELINE.map((step, i) => (
          <div key={step.country} className="flex items-center gap-2">
            {i > 0 && <div className="shrink-0 text-neutral-600">→</div>}
            <StepCard step={step} />
          </div>
        ))}
        <div className="shrink-0 text-neutral-600">→</div>
        {todayStep ? <StepCard step={todayStep} /> : <PendingStepCard />}
      </div>
    </div>
  );
}
