'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const TIMEOUT_DURATION = 2 * 60 * 60 * 1000; // 2 hours in ms

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now());
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity'), 10);
      const now = Date.now();

      if (lastActivity && now - lastActivity > TIMEOUT_DURATION) {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('lastActivity');
        alert('Session expired due to inactivity.');
        router.push('/login');
      }
    };

    // Setup listeners
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    // Initial activity timestamp if not set
    if (!localStorage.getItem('lastActivity')) {
      updateActivity();
    }

    // Start checking inactivity every 10 seconds
    const interval = setInterval(checkInactivity, 10000);

    // Cleanup
    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [router]);

  return <>{children}</>;
}
