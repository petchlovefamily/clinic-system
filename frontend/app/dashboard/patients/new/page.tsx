// app/dashboard/patients/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function NewPatientPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 1. นำ Medical History และ Current Medications กลับเข้าสู่ State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Other',
    dateOfBirth: '',
    allergies: '',
    medicalHistory: '', // <-- นำกลับมา
    currentMedications: '', // <-- นำกลับมา
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !(user.role === 'RECEPTION' || user.role === 'ADMIN')) {
      router.push('/dashboard/patients');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // API call remains the same (backend accepts all fields)
      await axios.post('http://localhost:5000/api/patients', formData);
      
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard/patients');
      }, 1500);

    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create patient');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                Add New Patient
              </h1>
              <p className="text-gray-600">Create a new patient record in the system</p>
            </div>
            
            <Link 
              href="/dashboard/patients"
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
              Patient created successfully! Redirecting...
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
            
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    required
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    required
                    placeholder="Enter last name"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="dateOfBirth">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section (Restored) */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                Medical Information
              </h3>

              {/* Allergies */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="allergies">
                  Allergies
                  <span className="text-gray-500 text-xs normal-case ml-2">(Optional)</span>
                </label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="List any known allergies (e.g., medications, food, environmental)..."
                />
              </div>

              {/* Medical History (Restored) */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="medicalHistory">
                  Medical History
                  <span className="text-gray-500 text-xs normal-case ml-2">(Optional)</span>
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="Summarize past illnesses, surgeries, and chronic conditions..."
                />
              </div>

              {/* Current Medications (Restored) */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="currentMedications">
                  Current Medications
                  <span className="text-gray-500 text-xs normal-case ml-2">(Optional)</span>
                </label>
                <textarea
                  id="currentMedications"
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="List all current prescriptions and over-the-counter drugs..."
                />
              </div>
            </div>


            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || success}
                className={`w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 ${
                  loading || success
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving Patient...
                  </>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Patient Created!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Patient
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
              <p className="text-sm text-blue-900 font-semibold mb-1">Patient Information Guidelines</p>
              <p className="text-sm text-blue-800">
                Please ensure all required information is accurate. This data will be used for medical records and appointments.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}