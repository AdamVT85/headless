/**
 * ACCORDION COMPONENT
 * Simple, accessible accordion for collapsible content sections
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between py-6 text-left',
          'hover:text-terracotta transition-colors'
        )}
        aria-expanded={isOpen}
      >
        <h3 className="font-serif text-xl md:text-2xl font-medium text-olive pr-4">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            'h-6 w-6 text-terracotta transition-transform duration-200 flex-shrink-0',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[2000px] pb-6' : 'max-h-0'
        )}
      >
        <div className="prose prose-stone max-w-none">{children}</div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('bg-white rounded-sm border border-stone-200 divide-y divide-stone-200 px-6', className)}>
      {children}
    </div>
  );
}
