'use client';

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Calculator, LayoutDashboard, TrendingUp, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    setIsHeaderVisible(true);
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (session) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="bg-black text-white">
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isHeaderVisible && 'animate-slide-down',
          'bg-black/50 backdrop-blur-lg'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2 z-50">
            <Calculator className="h-6 w-6" />
            <span className="font-bold text-lg">CGPA Calculator</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              Login
            </Link>
            <Button asChild variant="secondary" className="ml-2">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-in-from-right">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90">
              <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Features</Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Login</Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-800">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative">
        <section className="relative flex items-center justify-center min-h-screen pt-16">
          <div className="absolute inset-0 z-0">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <div className="clouds"></div>
          </div>
          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
              Effortlessly Track Your Academic Progress
            </h1>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-300">
              Our CGPA calculator helps you stay on top of your grades, visualize your performance, and plan for a successful academic future.
            </p>
            <Button asChild size="lg">
              <Link href="/register">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-gray-800/50 rounded-lg text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Accurate Calculations</h3>
                <p className="text-gray-400">Calculate your SGPA and CGPA with precision, based on your university&apos;s grading system.</p>
              </div>
              <div className="p-6 bg-gray-800/50 rounded-lg text-center">
                <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Interactive Dashboard</h3>
                <p className="text-gray-400">A beautiful and intuitive dashboard to manage your semester-wise grades and results.</p>
              </div>
              <div className="p-6 bg-gray-800/50 rounded-lg text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Performance Analysis</h3>
                <p className="text-gray-400">Visualize your academic performance with insightful charts and graphs.</p>
              </div>
              <div className="p-6 bg-gray-800/50 rounded-lg text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
                <p className="text-gray-400">Monitor your CGPA trend over semesters and set goals for future improvement.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Grades?</h2>
            <p className="max-w-xl mx-auto mb-8 text-gray-400">
              Sign up now and start managing your academic performance like a pro.
            </p>
            <Button asChild size="lg">
              <Link href="/register">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-6 bg-gray-900/50">
        <div className="container mx-auto px-4 md:px-6 text-center text-gray-400">
          <p>&copy; 2024 CGPA Calculator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
