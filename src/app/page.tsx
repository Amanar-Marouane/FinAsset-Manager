'use client';

import React from 'react';
import PageContainer from '@/components/layout/page-container';

export default function Page(): React.JSX.Element {

  return (
    <PageContainer className="px-4 py-8">
      <div className="flex flex-col gap-8 w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Auth Guard Here
          </h1>
        </div>
      </div>
    </PageContainer>
  );
}
