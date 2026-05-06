import { Outlet } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
