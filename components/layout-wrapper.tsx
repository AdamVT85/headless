'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import { Footer } from '@/components/ui/footer';
import { FavouritesProvider } from '@/contexts/favourites-context';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname.startsWith('/studio');

  // Studio needs full viewport control - no site chrome
  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <FavouritesProvider>
      <Navigation />
      <div className="flex-1">{children}</div>
      <Footer />
    </FavouritesProvider>
  );
}
