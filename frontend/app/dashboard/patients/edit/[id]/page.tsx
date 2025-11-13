// app/dashboard/patients/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface PatientData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  allergies: string;
  medicalHistory: string;
  currentMedications: string;
}

export default function EditPatientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [formData, setFormData] = useState<PatientData>({
    firstName: '',
    lastName: '',
    gender: 'Other',
    dateOfBirth: '',
    allergies: '',
    medicalHistory: '',
    currentMedications: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!id || !user) return;

    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
        const data = response.data;
        
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          gender: data.gender || 'Other',
          dateOfBirth: formatDateForInput(data.dateOfBirth),
          allergies: data.allergies || '',
          medicalHistory: data.medicalHistory || '',
          currentMedications: data.currentMedications || '',
        });

      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [id, user]);

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
      await axios.put(`http://localhost:5000/api/patients/${id}`, formData);
      
      setSubmitting(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard/patients');
      }, 1500);

    } catch (err: any) {
      setSubmitting(false);
      setError(err.response?.data?.message || 'Failed to update patient');
    }
  };

  const canEdit = user?.role === 'RECEPTION' || user?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Loading patient details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !formData.firstName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Patient</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link 
            href="/dashboard/patients"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Back to Patients
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
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                {canEdit ? 'Edit Patient' : 'View Patient'}
              </h1>
              <p className="text-gray-600">
                {formData.firstName} {formData.lastName}
              </p>
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

          {/* Permission Notice for Read-Only */}
          {!canEdit && (
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-900 font-semibold">Read-Only Mode</p>
                  <p className="text-sm text-yellow-800">You do not have permission to edit patient records. Contact an administrator for assistance.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          
          {/* Success Message */}
          {success && (
            <div className="mb-8 bg-teal-50 border-2 border-teal-200 text-teal-800 font-medium p-5 rounded-2xl text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Patient updated successfully! Redirecting...
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
            <fieldset disabled={!canEdit}>
              
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
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      required
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
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      required
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
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  Medical Information
                </h3>

                <div className="space-y-6">
                  {/* Allergies */}
                  <div>
                    <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="allergies">
                      Allergies
                      <span className="text-gray-500 text-xs normal-case ml-2">(Optional)</span>
                    </label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                      rows={3}
                      placeholder="List any known allergies..."
                    />
                  </div>

                  {/* Medical History */}
                  <div>
                    <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="medicalHistory">
                      Medical History
                      <span className="text-gray-500 text-xs normal-case ml-2">(Optional)</span>
                    </label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                      rows={4}
                      placeholder="Previous diagnoses, surgeries, chronic conditions..."
                    />
                  </div>

                  {/* Current Medications */}
                  <div>
                    <label className="block text-gray-700 mb-3 font-semibold text-sm uppercase tracking-wide" htmlFor="currentMedications">
                      Current Medications
                      <span className="text-gray-500 text-xs normal-case ml-2">(Optional)</span>
                    </label>
                    <textarea
                      id="currentMedications"
                      name="currentMedications"
                      value={formData.currentMedications}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                      rows={3}
                      placeholder="List current medications and dosages..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button - Only show if can edit */}
              {canEdit && (
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className={`w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 ${
                      submitting || success
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
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

              {/* Required Fields Note */}
              <p className="text-sm text-gray-500 text-center">
                <span className="text-red-500">*</span> Required fields
              </p>
            </fieldset>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-semibold mb-1">Patient Record Guidelines</p>
              <p className="text-sm text-blue-800">
                {canEdit 
                  ? 'Please ensure all medical information is accurate and up to date. Changes are logged for compliance.'
                  : 'You are viewing this record in read-only mode. Only Reception and Admin staff can make changes.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}