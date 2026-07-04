import * as React from 'react';

import { MobileNav } from './MobileNav';
import { TopNav } from './TopNav';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <TopNav />
      <main className="flex-1 pb-24 pt-5 md:pb-10 md:pt-7">
        <div className="page-container">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
