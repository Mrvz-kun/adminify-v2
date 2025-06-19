'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Eye, EyeOff } from 'lucide-react';
import { usersData } from '../../../public/data/Users';
import './page.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const router = useRouter();

  const quotes = [
  "Wala lang, gusto ko lang may lumalabas banda dito sa screen",
  "Kapag pagod ka na, alalahanin mong wala kang choice",

];

const [typedQuote, setTypedQuote] = useState("");
const [displaying, setDisplaying] = useState(true); // true = typing, false = erasing
const [quoteIndex, setQuoteIndex] = useState(0);

useEffect(() => {
  let interval;
  const current = quotes[quoteIndex % quotes.length];

  if (displaying) {
    interval = setInterval(() => {
      setTypedQuote((prev) => {
        if (prev.length < current.length) {
          return current.slice(0, prev.length + 1);
        } else {
          clearInterval(interval);
          setTimeout(() => setDisplaying(false), 5000); // wait before erasing
          return prev;
        }
      });
    }, 70);
  } else {
    interval = setInterval(() => {
      setTypedQuote((prev) => {
        if (prev.length > 0) {
          return prev.slice(0, -1);
        } else {
          clearInterval(interval);
          setDisplaying(true);
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
          return "";
        }
      });
    }, 40);
  }

  return () => clearInterval(interval);
}, [displaying, quoteIndex]);




    useEffect(() => {
    const handleMouseMove = (e) => {
      const interactive = document.querySelector('.interactive');
      if (interactive) {
        const x = e.clientX;
        const y = e.clientY;
        interactive.style.left = `${x}px`;
        interactive.style.top = `${y}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!username) validationErrors.username = 'Username is required';
    if (!password) validationErrors.password = 'Password is required';

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    const matchedUser = usersData.find(
    (user) => user.username === username && user.password === password
    );

    if (matchedUser) {
    localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
    router.push('/admin');
    } else {
    setError({ password: 'Invalid username or password' });
    }

  };

  return (
    <>
     <div className="gradient-bg"> {/* Background wrapper */}
      {/* SVG filter for gooey effect */}
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Floating gradient blobs */}
      <div className="gradients-container" filter="url(#goo)">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>
        <div className="g4"></div>
        <div className="g5"></div>
        <div className="interactive"></div>
      </div>

      {/* Your centered login form */}
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md px-8 py-10 text-white z-10">
          <h2 className="text-3xl font-black text-center mb-6 tracking-widest">Adminify.v2</h2>

          <form onSubmit={handleLogin} name="users-form" className="space-y-5">
            {/* Username Dropdown */}
            <div className="form-control">
              <label className="text-sm font-semibold text-white">Username</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="select select-bordered w-full bg-white/20 text-white backdrop-blur-sm border-white/30 placeholder:text-white/60"
              >
                <option value="" disabled hidden>
                  Select a user
                </option>
                {usersData.map((user) => (
                  <option className='bg-white/20 backdrop-blur-md text-black' key={user.id} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
              {error.username && (
                <p className="text-red-400 text-xs mt-1">{error.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="text-sm font-semibold text-white">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input input-bordered w-full bg-white/20 text-white pr-10 placeholder:text-white/50 backdrop-blur-sm border-white/30"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              {error.password && (
                <p className="text-red-400 text-xs mt-1">{error.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              id="login-button"
              type="submit"
              className="btn btn-neutral w-full mt-4"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <div className="quote-overlay">
        <p className="quote-text">{typedQuote}<span className="cursor">|</span></p>
      </div>

    </div>
    </>
  );
}
