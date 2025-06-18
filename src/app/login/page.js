'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Eye, EyeOff } from 'lucide-react';
import { usersData } from '../../../public/data/Users';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const router = useRouter();

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
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="container bg-base-100 rounded-lg shadow-lg w-1/4 p-6 py-24">
          <h2 className="text-2xl font-bold text-center mb-4 pt-6">Adminify.</h2>

          <form onSubmit={handleLogin} name="users-form" className="text-sm pt-6 p-6">
            {/* Username Dropdown */}
            <div className="form-control mb-3">
              <label className="block">
                <span className="label-text text-sm">User</span>
                <select
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="select select-bordered w-full mt-1"
                >
                  <option value="" disabled/>

                  {usersData.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {error.username && (
                  <p className="text-red-500 text-xs">{error.username}</p>
                )}
              </label>
            </div>

            {/* Password Field */}
            <div className="form-control mb-3">
              <label className="block">
                <span className="label-text text-sm">Password</span>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full mt-1 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 z-10 text-neutral-content"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {error.password && (
                  <p className="text-red-500 text-xs mt-1">{error.password}</p>
                )}
              </label>
            </div>

            {/* Login Button */}
            <button
              id="login-button"
              type="submit"
              className="btn w-full btn-neutral mt-8"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
