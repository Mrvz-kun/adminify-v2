'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import Dashboard from '@/components/Dashboard'
import Attendance from '@/components/Attendance'
import LeaveApplication from '@/components/AFL'
import Directory from '@/components/Directory'
import SuppliesInventory from '@/components/SuppliesInventory'
import PrintAttendance from '@/components/PrintAttendance'
import FooterActivity from '@/components/FooterActivity'
import { useAttendance } from "@/hooks/useAttendance";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityLogProvider } from '@/context/LogContext';



export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const {
  attendances,
  loading,
  error
} = useAttendance();

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return (
    <ActivityLogProvider>
    <div className="flex h-screen">
      {sidebarOpen && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <div className="flex-1 flex flex-col">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1  px-6 py-4 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'attendance' && <Attendance
              attendances={attendances}
              loading={loading}
              error={error}
              setActiveTab={setActiveTab} />
          }
          {activeTab === 'leave' && <LeaveApplication />}
          {activeTab === 'directory' && <Directory />}
          {activeTab === 'inventory' && <SuppliesInventory />}
          {activeTab === 'print' && (
            <PrintAttendance
              attendances={attendances}
              loading={loading}
              error={error}
            />
          )}
        </main>
        <FooterActivity />
      </div>
    </div>
    </ActivityLogProvider>
  )
}
