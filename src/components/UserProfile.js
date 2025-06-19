'use client';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import useAuth from '@/hooks/useAuth';
import { useActivityLog } from '@/context/LogContext';
import axios from 'axios';
import { usersData } from '../../public/data/Users';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function UserProfile({ onClose }) {
  const { user } = useAuth();
  const { logs } = useActivityLog();
  const panelRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '/avatar.webp');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [aflCount, setAFLCount] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const availableAvatars = [
  '/avatar-porcupine.svg',
  '/avatar-boar.svg',
  '/avatar-koala.svg',
  '/avatar-racoon.svg',
  '/avatar-dear.svg',
  '/avatar-hippo.svg',
  '/avatar-lion.svg',
  '/avatar-owl.svg',
];

  // Fetch attendance & AFL counts from API
  useEffect(() => {
    if (!user?.username) return;

    // Get avatar directly from static usersData
    const found = usersData.find(
      (u) => u.username.toLowerCase().trim() === user.username.toLowerCase().trim()
    );

    if (found?.avatar) {
      setAvatarPreview(found.avatar);
    }

    // Still fetch dynamic counts
    const fetchUserStats = async () => {
      try {
        const res = await axios.get(`/api/user?username=${user.username}`);
        setAttendanceCount(res.data.attendanceCount || 0);
        setAFLCount(res.data.aflCount || 0);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      }
    };

    fetchUserStats();
  }, [user?.username]);

  useEffect(() => {
  if (!user?.username) return;

  // 1. Try loading from localStorage
  const storedAvatar = localStorage.getItem(`avatar-${user.username}`);
  if (storedAvatar) {
    setAvatarPreview(storedAvatar);
    return;
  }

  // 2. Fallback to static usersData
  const found = usersData.find(
    (u) => u.username.toLowerCase().trim() === user.username.toLowerCase().trim()
  );
  if (found?.avatar) {
    setAvatarPreview(found.avatar);
  }
}, [user?.username]);


const handleAvatarSelect = (avatar) => {
  setAvatarPreview(avatar);
  localStorage.setItem(`avatar-${user.username}`, avatar);
  setShowAvatarPicker(false);

    // Trigger a custom event to notify avatar change
  window.dispatchEvent(new Event('avatar-updated'));
};

const userLogs = (logs || [])
  .filter((log) =>
    log.action?.toLowerCase().startsWith(user?.username?.toLowerCase())
  )
  .slice(0, 5);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-1000 bg-black/30">
      <motion.div
        ref={panelRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="absolute top-0 right-0 h-full w-96 bg-base-100 shadow-2xl border-l border-base-300 flex flex-col"
      >
        {/* Top section */}
        <div className="p-5 relative border-b border-base-300 flex flex-col items-center">
          <button
            className="absolute right-4 top-4 text-base-content/70 font-semibold hover:cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>

          <Image
            src={avatarPreview}
            alt="Avatar"
            width={80}
            height={80}
            className="rounded-full border mb-3 mt-8"
          />
          <button className="btn btn-xs mb-2" onClick={() => setShowAvatarPicker(true)}>
            Change Avatar
          </button>
          <h2 className="text-lg font-semibold">{user?.name}</h2>
          <p className="text-sm text-base-content/60">@{user?.username}</p>
        </div>

        {/* Stats */}
        <div className="px-5 py-4 bg-base-300 flex flex-col items-center justify-center gap-4 text-center">
          <div>
            <div className="text-xl font-bold">{attendanceCount}</div>
            <div className="text-xs text-base-content/60">
              Attendances Encoded
            </div>
          </div>
          <div>
            <div className="text-xl font-bold">{aflCount}</div>
            <div className="text-xs text-base-content/60">
              AFLs Encoded
            </div>
          </div>
        </div>




        {/* Recent Activity */}
        <div className="flex-1 px-5 py-4 overflow-y-auto bg-base-300">
          <h3 className="font-semibold text-sm mb-4">Recent Activities</h3>
          <ul className="text-xs space-y-2">
            {userLogs.length > 0 ? (
              userLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-2">
                  {/* Ping animation */}
                  <div className="relative w-3 h-3 mt-1">
                    <div className="status animate-ping absolute inset-0"></div>
                    <div className="status absolute inset-0"></div>
                  </div>

                  {/* Message with timestamp below */}
                  <div className="flex flex-col">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-base-content/50">
                      {dayjs(log.timestamp).fromNow()}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-base-content/50">No recent activity</li>
            )}
          </ul>
        </div>

        {showAvatarPicker && (
  <div className="fixed inset-0 bg-black/30 z-[2000] flex items-center justify-center">
    <div className="bg-base-100 p-4 rounded-lg shadow-xl w-[90%] max-w-md">
      <h3 className="text-sm font-semibold mb-3">Choose Your Avatar</h3>
      <div className="grid grid-cols-3 gap-4">
        {availableAvatars.map((avatar) => (
          <div
            key={avatar}
            onClick={() => {
              handleAvatarSelect(avatar);
              setShowAvatarPicker(false);
              // Optional: persist to server/localStorage
            }}
            className="cursor-pointer hover:scale-105 transition"
          >
            <Image width={56} height={56} src={avatar} alt="avatar" className="rounded-md border" />
                  </div>
                ))}
              </div>

              <div className="mt-4 text-right">
                <button className="btn btn-sm" onClick={() => setShowAvatarPicker(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
