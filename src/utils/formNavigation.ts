import React from 'react';

/**
 * Handle Enter key to move focus to the next focusable field inside a form.
 * - Skips TextArea (keeps newline behavior)
 * - Skips when antd Select/DatePicker dropdowns are open (let Enter select/confirm)
 * - Prevents default submit on Enter
 * - Supports Shift+Enter to move focus to previous field (optional convenience)
 */
const focusableSelector = [
  'input:not([type="hidden"]):not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[role="combobox"]:not([aria-disabled="true"])',
  '.ant-picker-input input:not([disabled])'
].join(',');

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetParent || el.getClientRects().length);
}

function isFocusable(el: HTMLElement): boolean {
  if (el.getAttribute('tabindex') === '-1') return false;
  // @ts-expect-error: not all elements have disabled
  if (el.disabled) return false;
  const ariaDisabled = el.getAttribute('aria-disabled');
  if (ariaDisabled === 'true') return false;
  if (el.hasAttribute('hidden')) return false;
  return isVisible(el);
}

export function handleEnterFocusNext(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== 'Enter') return;

  const target = e.target as HTMLElement | null;
  if (!target) return;

  // Keep newline behavior in textareas
  if (target.closest('textarea')) return;

  // Skip when modifiers are pressed
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // antd Select: if dropdown open, allow Enter to select
  const selectRoot = target.closest('.ant-select') as HTMLElement | null;
  if (selectRoot && (selectRoot.classList.contains('ant-select-open') || selectRoot.getAttribute('aria-expanded') === 'true')) {
    return;
  }

  // antd DatePicker: if panel open, allow Enter to confirm
  const pickerRoot = target.closest('.ant-picker') as HTMLElement | null;
  if (pickerRoot && pickerRoot.classList.contains('ant-picker-open')) {
    return;
  }

  // Find parent form
  const formEl = target.closest('form');
  if (!formEl) return;

  // Ignore buttons
  if (target.tagName === 'BUTTON') return;

  // Ordered focusable elements within the form
  const candidates = Array.from(formEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(isFocusable);
  if (candidates.length === 0) return;

  const current = target.matches(focusableSelector) ? target : (target.closest(focusableSelector) as HTMLElement | null);
  if (!current) return;

  const index = candidates.findIndex((el) => el === current);
  if (index === -1) return;

  const nextIndex = e.shiftKey ? index - 1 : index + 1;
  const next = candidates[nextIndex];

  if (next) {
    e.preventDefault();
    e.stopPropagation();
    next.focus();

    // Select text if it's an input/textarea
    if (next.tagName === 'INPUT' || next.tagName === 'TEXTAREA') {
      try {
        (next as HTMLInputElement | HTMLTextAreaElement).select?.();
      } catch {
        // no-op
      }
    }
  } else {
    // Prevent accidental submit on the last field
    e.preventDefault();
  }
}
