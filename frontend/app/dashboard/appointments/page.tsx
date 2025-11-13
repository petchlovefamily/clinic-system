// app/dashboard/appointments/page.tsx
"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: number;
  recordNumber: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'COMPLETED';
  patient: {
    recordNumber: string;
    firstName: string;
    lastName: string;
  };
  clinician: {
    username: string;
  };
}

export default function AppointmentsPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // 1. ฟังก์ชันดึงข้อมูล (ถูกแยกออกมาเพื่อให้เรียกใช้ซ้ำได้)
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchAppointments(); // เรียกใช้ฟังก์ชันดึงข้อมูล
  }, [token, router]);

  // 2. ฟังก์ชัน Handle Delete (Soft Delete)
  const handleDelete = async (appointmentId: number) => {
    if (!confirm(`Are you sure you want to archive appointment ${appointmentId}? This action cannot be undone.`)) {
      return;
    }
    try {
      // API DELETE /api/appointments/:id ถูก Implement ไว้ใน Backend แล้ว
      await axios.delete(`http://localhost:5000/api/appointments/${appointmentId}`);
      alert(`Appointment ${appointmentId} archived successfully.`);
      fetchAppointments(); // ดึงรายการมาอัปเดตใหม่
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive appointment');
    }
  };


  // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.clinician.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || appt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const canManage = user?.role === 'RECEPTION' || user?.role === 'ADMIN';


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Appointments</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link 
            href="/dashboard"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Appointment Management
              </h1>
              <p className="text-gray-600">Schedule and track patient appointments</p>
            </div>
            
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{appointments.length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by patient, clinician, or record..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    filterStatus === 'ALL'
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    filterStatus === 'PENDING'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('COMPLETED')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    filterStatus === 'COMPLETED'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Add Appointment Button */}
              {user && (user.role === 'RECEPTION' || user.role === 'ADMIN') && (
                <Link 
                  href="/dashboard/appointments/new"
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Appointment
                </Link>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-teal-600">{filteredAppointments.length}</span> of <span className="font-semibold">{appointments.length}</span> appointments
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Appointments Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Start by scheduling a new appointment'}
              </p>
              {user && (user.role === 'RECEPTION' || user.role === 'ADMIN') && !searchTerm && filterStatus === 'ALL' && (
                <Link 
                  href="/dashboard/appointments/new"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Schedule First Appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Record #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Clinician
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{appt.recordNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {appt.patient.firstName} {appt.patient.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-900">{appt.clinician.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {new Date(appt.startTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          appt.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            appt.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></span>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <Link
                          href={`/dashboard/appointments/edit/${appt.id}`}
                          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors group"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View/Edit
                        </Link>

                        {/* 3. ปุ่ม Delete (Soft Delete) */}
                        {canManage && (
                            <button
                              onClick={() => handleDelete(appt.id)}
                              className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}