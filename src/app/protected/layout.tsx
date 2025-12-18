'use client';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';


export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayout>
            <KBar>
                <SidebarProvider defaultOpen={true}>
                    <AppSidebar />
                    <SidebarInset>
                        <Header />
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </KBar>
        </AppLayout>
    );
}
