// AI Chat page - Full-page chat interface
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AIChat } from '@/components/ai/AIChat';
import { supabase } from '@/lib/supabaseClient';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ChatPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Redirect to login
        router.push('/login?redirect=/chat');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login?redirect=/chat');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="mb-4">
            <div className="w-12 h-12 border-4 border-[#FF6A3D] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          <p>Indlæser...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>AI Kursus Assistent | CourseHub</title>
        <meta
          name="description"
          content="Få hjælp til at finde de perfekte kurser med vores AI-drevne kursus assistent"
        />
      </Head>

      <div
        className="min-h-screen flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0F0F1A 0%, #1a1a2e 50%, #16213e 100%)',
        }}
      >
        {/* Navigation */}
        <Navigation />

        {/* Main chat area */}
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
          <div className="flex-1 max-w-4xl mx-auto w-full">
            {/* Page header */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                AI Kursus Assistent
              </h1>
              <p className="text-white/60">
                Powered by Claude 3.5 Sonnet - Find det perfekte kursus på sekunder
              </p>
            </div>

            {/* Chat interface */}
            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden"
              style={{
                height: 'calc(100vh - 280px)',
                minHeight: '500px',
                maxHeight: '800px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <AIChat />
            </div>

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-white/40 text-sm">
                💡 Tip: Vær så specifik som muligt i din forespørgsel for de bedste resultater
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
