'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { CourseSidebar, type CourseSidebarProps } from './CourseSidebar';

type CourseLayoutShellProps = CourseSidebarProps & {
  children: React.ReactNode;
};

export function CourseLayoutShell({
  children,
  ...sidebarProps
}: CourseLayoutShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const sidebarContent = (
    <CourseSidebar {...sidebarProps} onNavigate={() => setSheetOpen(false)} />
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-[280px] md:shrink-0 md:border-r md:bg-card md:overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Main Content - margen para el sidebar */}
      <div
        className="flex-1 min-h-screen flex flex-col md:ml-[280px]"
      >
        {/* Mobile Menu Button */}
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b bg-background/95 backdrop-blur px-4 py-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú del curso</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] max-w-[85vw] p-0" showCloseButton={true}>
              <div className="h-full overflow-y-auto">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-medium truncate">{sidebarProps.course.title}</span>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
