// app/dashboard/appointments/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Appointment {
  id: number;
  recordNumber: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'COMPLETED';
  note: string | null;
  clinicianNote: string | null;
  patient: { id: number; recordNumber: string; firstName: string; lastName: string; };
  clinician: { id: number; username: string; };
}

export default function EditAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [status, setStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [clinicianNote, setClinicianNote] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- FIX: ฟังก์ชันแก้ไข Time Zone ---
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // สร้าง String YYYY-MM-DDTHH:MM โดยใช้ Local Time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  // ------------------------------------

  useEffect(() => {
    if (!id || !user) return;

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/appointments/${id}`);
        const data: Appointment = response.data;
        
        setAppointment(data);
        
        // ตั้งค่าฟอร์มโดยใช้ฟังก์ชันที่แก้ไขแล้ว
        setStatus(data.status);
        setClinicianNote(data.clinicianNote || '');
        setStartTime(formatDateTimeForInput(data.startTime)); // CORRECTED
        setEndTime(formatDateTimeForInput(data.endTime));     // CORRECTED
        setNote(data.note || '');

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointment();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      let dataToSubmit = {};

      if (user?.role === 'CLINICIAN') {
        // Clinician submits status and clinical note
        dataToSubmit = {
          status: status,
          clinicianNote: clinicianNote,
        };
      } else if (user?.role === 'RECEPTION' || user?.role === 'ADMIN') {
        // Reception submits schedule/admin note (Backend handles Time Zone conversion for submission)
        dataToSubmit = {
          startTime: startTime,
          endTime: endTime,
          note: note,
        };
      }

      await axios.put(`http://localhost:5000/api/appointments/${id}`, dataToSubmit);
      
      setSubmitting(false);
      setSuccess(true);
      
      // Redirect after success message display
      setTimeout(() => {
        router.push('/dashboard/appointments');
      }, 1500);

    } catch (err: any) {
      setSubmitting(false);
      setError(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  const canEditClinicianFields = user?.role === 'CLINICIAN';
  const canEditReceptionFields = user?.role === 'RECEPTION' || user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading appointment details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Appointment</h2>
          <p className="text-red-600 mb-6">{error || 'Appointment not found.'}</p>
          <Link 
            href="/dashboard/appointments"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Edit Appointment
              </h1>
              <p className="text-gray-600">Record #{appointment?.recordNumber}</p>
            </div>
            
            <Link 
              href="/dashboard/appointments"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </Link>
          </div>

          {/* Role Info Banner */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-900 font-semibold">Role-Based Editing</p>
                <p className="text-sm text-blue-800">
                  {canEditClinicianFields && 'As a Clinician, you can update status and add clinical notes.'}
                  {canEditReceptionFields && 'As Reception/Admin, you can modify scheduling and administrative notes.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          
          {/* Success Message */}
          {success && (
            <div className="mb-8 bg-teal-50 border-2 border-teal-200 text-teal-800 font-medium p-5 rounded-2xl text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Appointment updated successfully! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 text-red-700 font-medium p-5 rounded-2xl text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Read-Only Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Appointment Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Info */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <label className="font-semibold text-sm uppercase tracking-wide text-gray-700">Patient</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {appointment?.patient.firstName} {appointment?.patient.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Record: {appointment?.patient.recordNumber}</p>
                </div>

                {/* Clinician Info */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <label className="font-semibold text-sm uppercase tracking-wide text-gray-700">Clinician</label>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{appointment?.clinician.username}</p>
                </div>
              </div>
            </div>

            {/* Reception Fields Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Schedule & Administrative
                {!canEditReceptionFields && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Read Only</span>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Start Time */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="startTime">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={!canEditReceptionFields}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="endTime">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!canEditReceptionFields}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              {/* Reception Note */}
              <div>
                <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="note">
                  Administrative Note
                  <span className="text-gray-500 text-xs normal-case ml-2">(Reception Only)</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!canEditReceptionFields}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  rows={3}
                  placeholder="Internal notes for reception staff..."
                />
              </div>
            </div>

            {/* Clinician Fields Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Clinical Information
                {!canEditClinicianFields && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">Read Only</span>
                )}
              </h3>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="status">
                    Appointment Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'PENDING' | 'COMPLETED')}
                    disabled={!canEditClinicianFields}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Clinician Note */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="clinicianNote">
                    Clinical Notes
                    <span className="text-gray-500 text-xs normal-case ml-2">(Clinician Only)</span>
                  </label>
                  <textarea
                    id="clinicianNote"
                    name="clinicianNote"
                    value={clinicianNote}
                    onChange={(e) => setClinicianNote(e.target.value)}
                    disabled={!canEditClinicianFields}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={5}
                    placeholder="Examination findings, diagnosis, treatment plan, follow-up instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {(canEditClinicianFields || canEditReceptionFields) && (
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={submitting || success}
                  className={`w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 ${
                    submitting || success
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-green-600 hover:to-emerald-600 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving Changes...
                    </>
                  ) : success ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Changes Saved!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-semibold mb-1">Role-Based Access Control</p>
              <p className="text-sm text-blue-800">
                Different roles have access to different fields. Clinicians manage clinical aspects while Reception handles scheduling. All changes are logged for compliance.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}