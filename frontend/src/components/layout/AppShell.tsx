import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="page-shell flex md:pl-[19rem] xl:pl-80">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 pb-28 pt-6 md:pb-8 md:pt-8">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
