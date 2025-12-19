'use client';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';


export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayout>
            <KBar>
                <SidebarProvider defaultOpen={false}>
                    <AppSidebar />
                    <SidebarInset>
                        <Header
                            className='sm:hidden'
                            leftContent={
                                <div className="flex items-center gap-2 sm:hidden">
                                    <SidebarTrigger className="inline-flex items-center justify-center rounded-md border border-border px-2 py-1 text-sm" />
                                </div>
                            }
                        />
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </KBar>
        </AppLayout>
    );
}
