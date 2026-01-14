/**
 * GUEST PICKER COMPONENT
 * Popover selector for adults, children, and infants
 *
 * RALPH AUDIT: Accessibility (Escape key, click outside to close)
 */

'use client';

import { useState } from 'react';
import { Users, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GuestCounts {
  adults: number;
  children: number; // 3-17 years
  infants: number;  // <3 years
}

interface GuestPickerProps {
  value: GuestCounts;
  onChange: (guests: GuestCounts) => void;
  className?: string;
}

export function GuestPicker({ value, onChange, className }: GuestPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalGuests = value.adults + value.children + value.infants;

  const increment = (field: keyof GuestCounts) => {
    onChange({ ...value, [field]: value[field] + 1 });
  };

  const decrement = (field: keyof GuestCounts) => {
    if (field === 'adults' && value.adults <= 1) return; // Minimum 1 adult
    if (value[field] > 0) {
      onChange({ ...value, [field]: value[field] - 1 });
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-3 bg-white rounded-lg hover:border-olive focus:border-olive focus:outline-none transition-colors w-full",
          className?.includes('hero') ? 'border-none' : 'border border-stone-300'
        )}
      >
        <Users className="h-5 w-5 text-olive" />
        <span className="text-stone-800 font-medium">
          {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
        </span>
      </button>

      {/* Popover Content - RALPH AUDIT: Accessibility */}
      {isOpen && (
        <>
          {/* Backdrop - Click outside to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          />

          {/* Popover */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-stone-200 rounded-lg shadow-xl z-50 p-4">
            <div className="space-y-4">
              {/* Adults */}
              <GuestRow
                label="Adults"
                count={value.adults}
                onIncrement={() => increment('adults')}
                onDecrement={() => decrement('adults')}
                min={1}
              />

              {/* Children (3-17) */}
              <GuestRow
                label="Children"
                sublabel="3-17 years"
                count={value.children}
                onIncrement={() => increment('children')}
                onDecrement={() => decrement('children')}
              />

              {/* Infants (<3) */}
              <GuestRow
                label="Infants"
                sublabel="Under 3 years"
                count={value.infants}
                onIncrement={() => increment('infants')}
                onDecrement={() => decrement('infants')}
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 bg-olive hover:bg-olive/90 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Guest Row Component - Individual guest type row
 */
interface GuestRowProps {
  label: string;
  sublabel?: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
}

function GuestRow({ label, sublabel, count, onIncrement, onDecrement, min = 0 }: GuestRowProps) {
  const isMinimum = count <= min;

  return (
    <div className="flex items-center justify-between">
      {/* Label */}
      <div>
        <p className="font-serif text-lg text-stone-800">{label}</p>
        {sublabel && <p className="text-sm text-stone-500">{sublabel}</p>}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={isMinimum}
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center transition-colors',
            isMinimum
              ? 'border-stone-200 text-stone-300 cursor-not-allowed'
              : 'border-olive text-olive hover:bg-olive hover:text-white'
          )}
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="w-8 text-center font-semibold text-stone-800">{count}</span>

        <button
          type="button"
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-olive text-olive hover:bg-olive hover:text-white flex items-center justify-center transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
