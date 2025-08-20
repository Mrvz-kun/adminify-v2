'use client';

import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import useAuth from '@/hooks/useAuth'; 
import Image from 'next/image';
import UserProfile from './UserProfile'; 
import { AnimatePresence } from 'framer-motion';
import { usersData } from '../../public/data/Users';


export default function Navbar({ activeTab }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [avatar, setAvatar] = useState('/avatar.webp');

  useEffect(() => {
    const loadAvatar = () => {
      if (!user?.username) return;

      const stored = localStorage.getItem(`avatar-${user.username}`);
      if (stored) {
        setAvatar(stored);
      } else {
        const found = usersData.find(
          (u) => u.username.toLowerCase() === user.username.toLowerCase()
        );
        setAvatar(found?.avatar || '/avatar.webp');
      }
    };

    loadAvatar();

    const updateAvatar = () => loadAvatar();

    window.addEventListener('storage', updateAvatar);
    window.addEventListener('avatar-updated', updateAvatar);

    return () => {
      window.removeEventListener('storage', updateAvatar);
      window.removeEventListener('avatar-updated', updateAvatar);
    };
  }, [user?.username]);


  return (
    <>
      <nav className="w-full px-4 py-3 flex items-center justify-between sticky top-0 z-50" data-theme="black">
      {/* Left: Active Tab Label */}
      <div>
        <span className="font-black px-4 py-2 text-xl">
          Adminify. v2
        </span>
      </div>

      {/* Right: User Info + ThemeToggle */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="text-sm text-right">
            <span className="font-medium">Hello, </span>{' '}
            <span className="font-bold">{user.username}</span>
            <div className="avatar px-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden hover:cursor-pointer"
                onClick={() => setShowProfile(true)}
                >
                <Image
                  src={avatar || '/avatar.webp'}
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
      
    <AnimatePresence>
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </AnimatePresence>
    </>
  );
}
