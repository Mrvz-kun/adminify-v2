'use client'

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const router = useRouter();


    return (
        <>
          <div className={"flex items-center justify-center min-h-screen bg-base-200"}>
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            <div className="container bg-base-100 rounded-lg shadow-lg w-1/4 p-6 py-24">
              <h2 className="text-2xl font-bold text-center mb-4 pt-6">Adminify.</h2>
                <form  name='users-form' className="text-sm pt-6 p-6">
                    <div className="form-control mb-3">
                      <label className="block">
                        <span className="label-text text-sm ">Username</span>
                        <input value={username} onChange={(e) => setUsername(e.target.value)}  name='username' type="text" className="input input-bordered w-full mt-1 input-sm"/>
                        {error.username && <p className="text-red-500 text-xs">{error.username}</p>}
                      </label>
                    </div>
                    <div className="form-control mb-3">
                      <div className="relative">
                        <label className="block">
                          <span className="label-text text-sm ">Password</span>
                          <div className="relative">
                            <input
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              name="password"
                              type={showPassword ? "text" : "password"}
                              className="input input-bordered w-full mt-1 input-sm pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-content"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <Eye /> : <EyeOff />}
                            </button>
                          </div>
                        </label>
                        {error.password && <p className="text-red-500 text-xs mt-1">{error.password}</p>}
                      </div>
                    </div>
                    <button id="login-button" type='submit' className="btn flex items-center  w-full mt-8">Login</button>
                </form>
            </div>
          </div>
        </>
    )
}