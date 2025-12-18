import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

/**
 * General Page Container Component
 *
 * Usage Examples:
 *
 * 1. Basic scrollable container:
 * <PageContainer>
 *   <YourContent />
 * </PageContainer>
 *
 * 2. Non-scrollable with custom padding:
 * <PageContainer
 *   scrollable={false}
 *   padding="p-6"
 * >
 *   <FixedContent />
 * </PageContainer>
 *
 * 3. Full height container:
 * <PageContainer
 *   height="h-screen"
 *   className="bg-gray-50"
 * >
 *   <FullPageContent />
 * </PageContainer>
 */

interface PageContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  height?: string;
  padding?: string;
  className?: string;
}

export default function PageContainer({
  children,
  scrollable = true,
  height = 'h-[calc(100dvh-64px)]',
  padding = 'p-4 md:px-6',
  className = ''
}: PageContainerProps) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className={`${height} ${className}`}>
          <div className={`flex flex-1 flex-col w-full ${padding}`}>{children}</div>
        </ScrollArea>
      ) : (
        <div className={`flex flex-1 flex-col w-full ${padding} ${height} ${className}`}>{children}</div>
      )}
    </>
  );
}
