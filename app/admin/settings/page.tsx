'use client';

import React from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import SystemSettings from '@/components/admin/system-settings';

export default function SystemSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <SystemSettings 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
