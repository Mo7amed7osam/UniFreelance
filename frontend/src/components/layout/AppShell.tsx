import * as React from 'react';

import { MobileNav } from './MobileNav';
import { TopNav } from './TopNav';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <TopNav />
      <main className="flex-1 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-4 md:pb-8 md:pt-5">
        <div className="page-container">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
