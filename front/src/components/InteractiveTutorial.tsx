import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { BUTTON, secondaryButton } from '../utils/theme';
import type { TabType } from './TabNavigation';

interface TutorialStep {
  title: string;
  /** One or two sentences. Shown verbatim, so keep it plain. */
  description: string;
  /** `data-tour` value of the element to spotlight, or a CSS selector. */
  target: string;
  /** Preferred side for the tooltip; flipped automatically when it will not fit. */
  position: 'top' | 'bottom' | 'left' | 'right';
  padding?: number;
  /** Tab to switch to before this step renders, so the user sees what is described. */
  tab?: TabType;
  /** Optional practical hint shown under the description. */
  hint?: string;
}

interface InteractiveTutorialProps {
  nightMode: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onTabChange?: (tab: TabType) => void;
  /** Tab the user was on when the tour started; restored when it ends. */
  returnTab?: TabType;
}

const TOOLTIP_WIDTH = 400;
const GAP = 18;
const VIEWPORT_MARGIN = 16;

/**
 * The tour. Every step names a stable `data-tour` hook rather than a position
 * in the DOM, and every step that talks about a tab actually switches to it —
 * the previous version described five screens while showing one.
 */
const STEPS: TutorialStep[] = [
  {
    title: 'Welcome to the HPRC Epigenome Browser',
    description:
      'This is a quick tour of the portal — about a minute. You can leave at any time and restart it later from the Tutorials tab.',
    target: '[data-tour="header"]',
    position: 'bottom',
    padding: 8,
    hint: 'Use ← and → to move between steps, or Esc to leave.',
  },
  {
    title: 'The workflow runs left to right',
    description:
      'Pick samples, decide which tracks to show, then visualise them. The first three tabs are those three steps in order; the rest are supporting tools.',
    target: '[data-tour="tabs"]',
    position: 'bottom',
    padding: 6,
  },
  {
    title: 'Step 1 — Sample',
    description:
      'Choose a reference genome, select the samples you care about, and tick the functional data layers you want. The numbered cards light up until each one has an answer.',
    target: '[data-tour="tab-sample"]',
    position: 'bottom',
    tab: 'sample',
    hint: 'One or two samples load fastest; five or more can slow the browser down.',
  },
  {
    title: 'Step 2 — Track',
    description:
      'Your selections expand into individual tracks here. Search them, filter by sample, and switch any of them off. Click anywhere on a row to toggle it.',
    target: '[data-tour="tab-tracks"]',
    position: 'bottom',
    tab: 'tracks',
    hint: 'Genome-alignment tracks stay locked on while something depends on them.',
  },
  {
    title: 'Step 3 — Browser',
    description:
      'The WashU Epigenome Browser renders whatever you enabled. Navigate by coordinate or gene name, zoom, and pan.',
    target: '[data-tour="tab-browser"]',
    position: 'bottom',
    tab: 'browser',
    hint: 'Press F for fullscreen.',
  },
  {
    title: 'Sessions save your whole setup',
    description:
      'Reference genome, samples, layers, enabled tracks and the browser location, all under one name. Export them to a file to move them between machines or share them.',
    target: '[data-tour="tab-sessions"]',
    position: 'bottom',
    tab: 'sessions',
  },
  {
    title: 'Data Availability answers “what exists?”',
    description:
      'A map, a cohort summary, a searchable track list and a per-sample matrix — use it to see which assays a sample carries before you commit to it.',
    target: '[data-tour="tab-availability-matrix"]',
    position: 'bottom',
    tab: 'availability-matrix',
  },
  {
    title: 'Start over whenever you like',
    description:
      'This clears every selection and returns you to the Sample tab. It shows you what is about to be cleared first.',
    target: '[data-tour="reset"]',
    position: 'left',
    padding: 10,
  },
  {
    title: 'Day or night',
    description: 'Switch themes to suit the room. The choice applies across every tab.',
    target: '[data-tour="night-mode"]',
    position: 'left',
    padding: 10,
  },
  {
    title: 'That is the whole tour',
    description:
      'Head to the Sample tab to begin. The Tutorials tab has fuller documentation and can replay this tour at any time.',
    target: '[data-tour="tab-tutorials"]',
    position: 'bottom',
    tab: 'tutorials',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function readRect(selector: string): Rect | null {
  let el: Element | null = null;
  try {
    el = document.querySelector(selector);
  } catch {
    return null;
  }
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function InteractiveTutorial({
  nightMode,
  onComplete,
  onSkip,
  onTabChange,
  returnTab,
}: InteractiveTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [targetMissing, setTargetMissing] = useState(false);
  const [tooltipHeight, setTooltipHeight] = useState(220);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  /* --------------------------------------------------- drive the tabs */

  useEffect(() => {
    if (step.tab) onTabChange?.(step.tab);
  }, [step.tab, onTabChange]);

  /* ------------------------------------------- track the target's box */

  // The target may not exist yet (a step that switches tabs has to wait for
  // that tab to render) and it can move afterwards, so look for it, then keep
  // watching.
  useEffect(() => {
    let cancelled = false;
    setTargetMissing(false);

    /** Read the target and store it. Returns false while it is still absent. */
    const apply = (): boolean => {
      if (cancelled) return false;
      const next = readRect(step.target);
      if (!next) return false;
      setRect((prev) =>
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
          ? prev
          : next
      );
      return true;
    };

    // Poll on a timer rather than requestAnimationFrame: rAF is paused while
    // the tab is in the background, which left the tour stuck on its loading
    // state until the user came back to it.
    let timer: ReturnType<typeof setInterval> | undefined;
    if (!apply()) {
      setRect(null);
      let attempts = 0;
      const MAX_ATTEMPTS = 60; // ~1.5s at 25ms
      timer = setInterval(() => {
        if (cancelled) return;
        if (apply()) {
          clearInterval(timer);
          return;
        }
        if (++attempts >= MAX_ATTEMPTS) {
          clearInterval(timer);
          console.warn('Tour: could not find', step.target);
          setTargetMissing(true);
        }
      }, 25);
    }

    const onLayoutChange = () => apply();
    window.addEventListener('resize', onLayoutChange);
    window.addEventListener('scroll', onLayoutChange, true);

    // A target can resize without the window doing anything (a panel expands,
    // a font loads); without this the spotlight drifts off the element.
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(onLayoutChange);
      observer.observe(document.body);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      window.removeEventListener('resize', onLayoutChange);
      window.removeEventListener('scroll', onLayoutChange, true);
      observer?.disconnect();
    };
  }, [step.target]);

  // Bring a target that is off-screen into view — once per step, so the
  // continuous re-measurement above does not fight the smooth scroll.
  const scrolledFor = useRef<string | null>(null);
  useEffect(() => {
    if (!rect || scrolledFor.current === step.target) return;
    scrolledFor.current = step.target;
    const offScreen = rect.top < VIEWPORT_MARGIN || rect.top + rect.height > window.innerHeight - VIEWPORT_MARGIN;
    if (!offScreen) return;
    try {
      document.querySelector(step.target)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch {
      /* selector already validated by readRect */
    }
  }, [rect, step.target]);

  // Measure the tooltip rather than assuming a height — the old fixed 200px
  // guess pushed longer steps off the bottom of the screen.
  useLayoutEffect(() => {
    if (tooltipRef.current) setTooltipHeight(tooltipRef.current.offsetHeight);
  }, [stepIndex, rect]);

  /* ----------------------------------------------------- step control */

  const goTo = useCallback((index: number) => {
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
  }, []);

  const finish = useCallback(
    (how: 'complete' | 'skip') => {
      if (returnTab) onTabChange?.(returnTab);
      if (how === 'complete') onComplete();
      else onSkip();
    },
    [onComplete, onSkip, onTabChange, returnTab]
  );

  // Functional updates, so holding down an arrow key advances one step per
  // press instead of collapsing a burst into a single move.
  const next = useCallback(() => {
    if (isLast) finish('complete');
    else setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }, [isLast, finish]);

  const previous = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          finish('skip');
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previous();
          break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [finish, next, previous]);

  // Keep focus on the tooltip so the arrow keys and Tab stay inside the tour.
  useEffect(() => {
    tooltipRef.current?.focus();
  }, [stepIndex]);

  /* ---------------------------------------------------------- layout */

  const padding = step.padding ?? 10;

  const tooltipStyle = useMemo((): React.CSSProperties => {
    if (!rect) return {};

    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN;
    const maxTop = window.innerHeight - tooltipHeight - VIEWPORT_MARGIN;
    const clampLeft = (v: number) => Math.max(VIEWPORT_MARGIN, Math.min(maxLeft, v));
    const clampTop = (v: number) => Math.max(VIEWPORT_MARGIN, Math.min(maxTop, v));

    const centredLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    const centredTop = rect.top + rect.height / 2 - tooltipHeight / 2;

    const below = rect.top + rect.height + padding + GAP;
    const above = rect.top - padding - GAP - tooltipHeight;
    const rightOf = rect.left + rect.width + padding + GAP;
    const leftOf = rect.left - padding - GAP - TOOLTIP_WIDTH;

    // Fall back to the opposite side when the preferred one would be clipped.
    switch (step.position) {
      case 'top':
        return above >= VIEWPORT_MARGIN
          ? { left: clampLeft(centredLeft), top: above }
          : { left: clampLeft(centredLeft), top: clampTop(below) };
      case 'left':
        return leftOf >= VIEWPORT_MARGIN
          ? { left: leftOf, top: clampTop(centredTop) }
          : { left: clampLeft(rightOf), top: clampTop(centredTop) };
      case 'right':
        return rightOf <= maxLeft
          ? { left: rightOf, top: clampTop(centredTop) }
          : { left: clampLeft(leftOf), top: clampTop(centredTop) };
      case 'bottom':
      default:
        return below <= maxTop
          ? { left: clampLeft(centredLeft), top: below }
          : { left: clampLeft(centredLeft), top: clampTop(above) };
    }
  }, [rect, tooltipHeight, step.position, padding]);

  /* ---------------------------------------------------------- render */

  const panel = nightMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900';

  if (targetMissing) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
        <div className={`${panel} rounded-2xl border p-6 max-w-md shadow-2xl text-center`} role="alertdialog" aria-modal="true">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-bold mb-2">Tour unavailable</h3>
          <p className={`text-sm mb-5 ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The guide could not find the part of the page it wanted to point at. Everything else works normally — you
            can read the written guide on the Tutorials tab instead.
          </p>
          <button
            onClick={() => finish('skip')}
            className={`px-6 py-2.5 font-semibold rounded-xl transition-colors ${BUTTON.primary}`}
          >
            Continue to the portal
          </button>
        </div>
      </div>
    );
  }

  if (!rect) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center" role="status" aria-live="polite">
        <div className={`${panel} rounded-2xl border p-6 shadow-2xl`}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-center text-sm">Starting the tour…</p>
        </div>
      </div>
    );
  }

  const spotlight = {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Scrim with a hole cut over the target. Clicking the scrim leaves the
          tour, which is what people reach for first. */}
      <svg
        className="absolute inset-0 w-full h-full"
        onClick={() => finish('skip')}
        aria-hidden="true"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect x={spotlight.x} y={spotlight.y} width={spotlight.width} height={spotlight.height} rx="12" fill="black" />
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask="url(#tour-spotlight-mask)" />
      </svg>

      <div
        className="absolute rounded-xl pointer-events-none tour-spotlight transition-all duration-300 ease-out"
        style={{ left: spotlight.x, top: spotlight.y, width: spotlight.width, height: spotlight.height }}
        aria-hidden="true"
      />

      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
        tabIndex={-1}
        className={`absolute ${panel} rounded-2xl shadow-2xl border-2 p-6 outline-none transition-all duration-300 ease-out`}
        style={{ ...tooltipStyle, width: TOOLTIP_WIDTH, maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`, zIndex: 10001 }}
      >
        {/* Progress. The pips are buttons so a reader who wants step 6 can go
            straight there instead of clicking Next five times. */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Tour steps">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={i === stepIndex}
                aria-label={`Step ${i + 1}: ${s.title}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? 'w-8 bg-primary-600'
                    : i < stepIndex
                      ? 'w-2 bg-primary-400'
                      : nightMode
                        ? 'w-2 bg-gray-600 hover:bg-gray-500'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-semibold tabular-nums ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {stepIndex + 1} / {STEPS.length}
          </span>
        </div>

        <h3 id="tour-title" className="text-xl font-bold mb-2">
          {step.title}
        </h3>
        <p id="tour-description" className={`text-sm leading-relaxed ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {step.description}
        </p>
        {step.hint && (
          <p
            className={`text-xs mt-3 rounded-lg px-3 py-2 ${
              nightMode ? 'bg-primary-900/30 text-primary-200' : 'bg-primary-50 text-primary-800'
            }`}
          >
            {step.hint}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            onClick={() => finish('skip')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              nightMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            <button
              onClick={previous}
              disabled={stepIndex === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${secondaryButton(nightMode)}`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={next}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${BUTTON.primary}`}
            >
              {isLast ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
