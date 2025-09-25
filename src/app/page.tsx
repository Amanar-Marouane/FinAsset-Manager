'use client';

import PageContainer from '@/components/layout/page-container';
import Footer from '@/components/ui/footer';

export default function Page() {

  return (
    <PageContainer className="px-4 py-8">
      <div className="flex flex-col gap-8 w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to <span className="text-primary">NextEdge</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A modern Next.js starter template with ready-to-use components
          </p>
        </div>

        <Footer className='fixed inset-x-0 bottom-0' />
      </div>
    </PageContainer>
  );
}
