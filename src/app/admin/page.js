'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import Dashboard from '@/components/Dashboard'
import AttendancePage from '@/components/attendance/Attendance'
import AFLPage from '@/components/afl/AFL'
import Directory from '@/components/Directory'
import Stocks from '@/components/supplies/Stocks'
import PrintAttendance from '@/components/attendance/PrintAttendance'
import Bincard from '@/components/supplies/Bincard'
import FooterActivity from '@/components/FooterActivity'
import { useAttendance } from '@/hooks/useAttendance'
import { useStock } from '@/hooks/useStock'
import { useRouter } from 'next/navigation'
import { ActivityLogProvider } from '@/context/LogContext'
import { ToastContainer } from 'react-toastify'

export default function Admin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stkRefId, setStkRefId] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);

  // Attendance
  const {
    attendances,
    loading: attendanceLoading,
    error: attendanceError
  } = useAttendance();

  // Stocks
  const {
    stocks,
    loading,
    error,
    addStock,
    deleteStock,
    updateStock,
    setStocks,
    fetchStocks,
  } = useStock();

const updateStockBalance = (stkRefId, newBalance) => {
  setStocks(prev =>
    prev.map(stock =>
      stock.stockId === stkRefId ? { ...stock, stockBalance: newBalance } : stock
    )
  );

  // ✅ Also update selectedStock if it's the same stkRefId
  setSelectedStock(prev =>
    prev?.stockId === stkRefId
      ? { ...prev, stockBalance: newBalance }
      : prev
  );
};



  // Auth guard
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
          <main className="flex-1 px-6 py-4 overflow-y-auto">
            <ToastContainer position="top-right" autoClose={5000} />
            
            {activeTab === 'dashboard' && <Dashboard />}

            {activeTab === 'attendance' && (
              <AttendancePage
                attendances={attendances}
                loading={attendanceLoading}
                error={attendanceError}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'leave' && <AFLPage />}
            {activeTab === 'directory' && <Directory />}

            {activeTab === 'inventory' && (
              <Stocks
                stocks={stocks}
                setStocks={setStocks}
                addStock={addStock}
                setStkRefId={setStkRefId}
                fetchStocks={fetchStocks} 
                loading={attendanceLoading}
                error={attendanceError}
                setActiveTab={setActiveTab}
                setSelectedStock={setSelectedStock} // ✅ pass the setter
                updateStockBalance={updateStockBalance}
              />
            )}

            {activeTab === 'bincard' && stkRefId && (
              <Bincard
                stkRefId={stkRefId}
                stock={selectedStock}
                loading={loading}
                error={error} 
                updateStockBalance={updateStockBalance} // ✅ Pass this
              />
            )}

            {activeTab === 'print' && (
              <PrintAttendance
                attendances={attendances}
                loading={attendanceLoading}
                error={attendanceError}
              />
            )}
          </main>
          <FooterActivity />
        </div>
      </div>
    </ActivityLogProvider>
  )
}
