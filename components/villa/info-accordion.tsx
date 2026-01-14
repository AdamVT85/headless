'use client';

/**
 * VILLA PAGE - ACCORDION COMPONENT
 * Collapsible sections for villa information
 */

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, content, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left hover:bg-gray-50 transition px-2"
      >
        <span className="font-serif text-lg text-vintage-green">{title}</span>
        {isOpen ? (
          <Minus size={18} className="text-gray-400 flex-shrink-0" />
        ) : (
          <Plus size={18} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="text-sm text-gray-600 px-2 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

interface InfoAccordionProps {
  items: Array<{ title: string; content: string }>;
}

export function InfoAccordion({ items }: InfoAccordionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white/50 backdrop-blur-sm p-1 rounded-lg">
      {items.map((item, idx) => (
        <AccordionItem key={idx} title={item.title} content={item.content} />
      ))}
    </div>
  );
}
