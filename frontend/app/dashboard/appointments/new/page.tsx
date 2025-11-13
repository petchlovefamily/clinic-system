// app/dashboard/appointments/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Patient {
  id: number;
  recordNumber: string;
  firstName: string;
  lastName: string;
}

interface Clinician {
  id: number;
  username: string;
}

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    patientId: '',
    clinicianId: '',
    startTime: '',
    endTime: '',
    note: '',
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (user.role !== 'RECEPTION' && user.role !== 'ADMIN')) {
        setError('You do not have permission to access this page.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [patientsRes, cliniciansRes] = await Promise.all([
          axios.get('http://localhost:5000/api/patients'),
          axios.get('http://localhost:5000/api/users/clinicians')
        ]);
        
        setPatients(patientsRes.data);
        setClinicians(cliniciansRes.data);

        if (patientsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, patientId: String(patientsRes.data[0].id) }));
        }
        if (cliniciansRes.data.length > 0) {
          setFormData(prev => ({ ...prev, clinicianId: String(cliniciansRes.data[0].id) }));
        }

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const dataToSubmit = {
        ...formData,
        patientId: parseInt(formData.patientId),
        clinicianId: parseInt(formData.clinicianId),
      };

      await axios.post('http://localhost:5000/api/appointments', dataToSubmit);
      
      setSubmitting(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard/appointments');
      }, 1500);

    } catch (err: any) {
      setSubmitting(false);
      setError(err.response?.data?.message || 'Failed to create appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading appointment data...</p>
        </div>
      </div>
    );
  }
  
  if (error && !patients.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-red-600 mb-6">{error}</p>
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
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                Schedule New Appointment
              </h1>
              <p className="text-gray-600">Create a new appointment for a patient</p>
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
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          
          {/* Success Message */}
          {success && (
            <div className="mb-8 bg-teal-50 border-2 border-teal-200 text-teal-800 font-medium p-5 rounded-2xl text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Appointment created successfully! Redirecting...
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
            
            {/* Appointment Participants Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                Appointment Participants
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="patientId">
                    Patient <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <select
                      id="patientId"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 cursor-pointer appearance-none"
                      required
                    >
                      {patients.length === 0 ? (
                        <option value="">No patients available</option>
                      ) : (
                        patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.recordNumber} - {p.firstName} {p.lastName}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Clinician Selection */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="clinicianId">
                    Clinician <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <select
                      id="clinicianId"
                      name="clinicianId"
                      value={formData.clinicianId}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 cursor-pointer appearance-none"
                      required
                    >
                      {clinicians.length === 0 ? (
                        <option value="">No clinicians available</option>
                      ) : (
                        clinicians.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.username}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Schedule Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="startTime">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="endTime">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Additional Notes
              </h3>

              {/* Notes */}
              <div>
                <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="note">
                  Notes
                  <span className="text-gray-500 text-xs normal-case ml-2">(Optional - Reception Only)</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="Add any special instructions or notes for this appointment..."
                />
                <p className="text-sm text-gray-500 mt-2">Optional notes visible only to reception staff</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting || success || patients.length === 0 || clinicians.length === 0}
                className={`w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 ${
                  submitting || success || patients.length === 0 || clinicians.length === 0
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Scheduling Appointment...
                  </>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Appointment Scheduled!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Appointment
                  </>
                )}
              </button>
            </div>

            {/* Required Fields Note */}
            <p className="text-sm text-gray-500 text-center">
              <span className="text-red-500">*</span> Required fields
            </p>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-semibold mb-1">Scheduling Guidelines</p>
              <p className="text-sm text-blue-800">
                Ensure the selected time slot does not conflict with existing appointments. The system will validate availability before confirming.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}