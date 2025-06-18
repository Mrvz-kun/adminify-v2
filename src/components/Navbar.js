'use client';

import React from 'react';
import ThemeToggle from './ThemeToggle';
import useAuth from '@/hooks/useAuth'; 
import Image from 'next/image'; 

const tabLabels = {
  dashboard: 'Dashboard',
  attendance: 'Attendance',
  leave: 'Leave Application',
  directory: 'Staff Directory',
};

export default function Navbar({ activeTab }) {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="w-full px-4 py-3 flex items-center justify-between sticky top-0 z-50" data-theme="black">
      {/* Left: Active Tab Label */}
      <div>
        <span className="font-black px-4 py-2 text-xl">
          Adminfy. v2
        </span>
      </div>

      {/* Right: User Info + ThemeToggle */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="text-sm text-right">
            <span className="font-medium">Hello, </span>{' '}
            <span className="font-bold">{user.username}</span>
            <div className="avatar px-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden hover:cursor-pointer">
                <Image
                  src={user.avatar || '/avatar.webp'}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <button onClick={logout} className="text-error ml-3 btn btn-xs btn-error btn-ghost rounded-2xl hover:text-white">
              Logout
            </button>
          </div>
        ) : (
          <span className="italic text-gray-400 text-sm">Not logged in</span>
        )}
      </div>
    </nav>
    <div className="fixed bottom-16 right-6 z-50">
      <ThemeToggle />
    </div>
    </>
  );
}
