// app/components/LoginForm.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          username: username,
          password: password,
        }
      );
      setLoading(false);
      login(response.data.token); 

    } catch (err: any) {
      setLoading(false);
      console.error('Login failed:', err);
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError('Could not connect to the server.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-white">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">Welcome Back</h2>
        
        <div className="mb-7">
          <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
            required
          />
        </div>

        {error && (
          <div className="mb-7 text-red-700 text-sm text-center font-medium bg-red-50 py-4 px-5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-teal-600 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 ${
            loading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors">Register</a>
        </div>
      </form>
    </div>
  );
}