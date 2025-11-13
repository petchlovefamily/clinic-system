// app/components/RegisterForm.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'RECEPTION',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Server unreachable.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-white">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">Create Account</h2>
        
        {success && (
          <div className="mb-7 bg-teal-50 text-teal-800 font-medium p-4 rounded-xl text-center border border-teal-100">
            Registration successful! Redirecting to login...
          </div>
        )}
        
        <div className="mb-7">
          <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
            required
          />
        </div>

        <div className="mb-7">
          <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 cursor-pointer"
          >
            <option value="RECEPTION">Reception</option>
            <option value="CLINICIAN">Clinician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && (
          <div className="mb-7 text-red-700 text-sm text-center font-medium bg-red-50 py-4 px-5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full bg-teal-600 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 ${
            loading || success
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors">Login</Link>
        </div>
      </form>
    </div>
  );
}