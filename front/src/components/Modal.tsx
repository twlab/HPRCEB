import { useEffect, useRef, type ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional line under the title explaining what the dialog does. */
  description?: ReactNode;
  children: ReactNode;
  /** Buttons for the bottom bar, in reading order (primary last). */
  footer?: ReactNode;
  /** Tailwind max-width class. Defaults to a comfortable form width. */
  maxWidth?: string;
  nightMode?: boolean;
}

/**
 * A dialog that behaves like one: Escape closes it, the backdrop closes it,
 * focus moves inside on open and returns to the trigger on close, and Tab is
 * trapped so a keyboard user cannot wander into the page behind the scrim.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  nightMode = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Callers pass an inline arrow for `onClose`, so its identity changes on
  // every render. Reading it through a ref keeps the effect below keyed on
  // `open` alone — depending on the callback re-ran the setup after each
  // keystroke, which pulled focus out of whatever field was being typed into.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Prefer the first field; fall back to the panel so Escape still lands.
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const first = focusables()[0];
    (first ?? panelRef.current)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl shadow-2xl outline-none ${
          nightMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        <div className={`flex items-start gap-4 px-6 pt-5 pb-4 border-b ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex-1 min-w-0">
            <h3 id={titleId} className="text-lg font-bold">
              {title}
            </h3>
            {description && (
              <p className={`text-sm mt-1 ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={`p-1.5 -mr-1.5 -mt-1 rounded-lg transition-colors ${
              nightMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div
            className={`flex flex-wrap gap-3 justify-end px-6 py-4 border-t ${
              nightMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
            } rounded-b-2xl`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
