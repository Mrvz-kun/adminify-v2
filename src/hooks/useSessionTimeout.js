import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export default function useSessionTimeout() {
  const router = useRouter();

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.removeItem('loggedInUser');
        router.push('/login');
      }, SESSION_TIMEOUT);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // initialize

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeout);
    };
  }, [router]);
}
