// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 🐛 Fix: Checking for loading state handled by DashboardLayout or if user is null
    if (!token && user === null) {
      router.push('/');
    }
  }, [token, user, router]);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    // --- FIX: เพิ่ม setTimeout เพื่อหน่วงเวลาให้ State เปลี่ยนก่อน Redirect ---
    setTimeout(() => {
      router.push('/');
    }, 50); // หน่วงเวลา 50ms 
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'CLINICIAN':
        return 'bg-gradient-to-r from-teal-600 to-cyan-600';
      case 'RECEPTION':
        return 'bg-gradient-to-r from-orange-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                {getGreeting()}, <span className="text-teal-600">{displayName}</span>
              </h1>
              <p className="text-gray-600 text-lg">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center ${getRoleBadgeColor(user.role)} text-white px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-xl`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions - Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Welcome Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Command Center</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to your healthcare management dashboard. Access patient records, manage appointments, and streamline your workflow with our intuitive tools.
              </p>
            </div>

            {/* Primary Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Manage Patients Card (Success/Data Management) */}
              <Link
                href="/dashboard/patients"
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Patients</h3>
                <p className="text-gray-600 text-sm">View, add, and update patient records</p>
              </Link>

              {/* Manage Appointments Card (Primary Workflow) */}
              <Link
                href="/dashboard/appointments"
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-teal-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Appointments</h3>
                <p className="text-gray-600 text-sm">Schedule and track appointments</p>
              </Link>

            </div>
          </div>

          {/* Sidebar - Info & Actions */}
          <div className="space-y-6">

            {/* Quick Stats Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700">System Status</span>
                  <span className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700">Your ID</span>
                  <span className="text-teal-600 font-bold text-sm">{user.userId}</span>
                </div>
              </div>
            </div>

            {/* System Info Card */}
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl shadow-xl p-8 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                System Info
              </h3>
              <p className="text-teal-50 text-sm leading-relaxed">
                Secure healthcare management system. All data is encrypted and compliant with healthcare standards.
              </p>
            </div>

            {/* Logout Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </main>
  );
}