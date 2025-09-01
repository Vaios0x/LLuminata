'use client';

import React from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import DeploymentManager from '@/components/admin/deployment-manager';

export default function DeploymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <DeploymentManager 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6"
            refreshInterval={30000}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
