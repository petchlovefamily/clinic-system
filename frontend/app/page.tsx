// app/page.tsx
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link'; // <-- 1. Import Link

export default function HomePage() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ตรวจสอบ Redirect: ถ้าล็อกอินแล้ว ให้ไป Dashboard
    if (token && user) {
      router.push('/dashboard');
    }
  }, [token, user, router]);

  if (!token) {
    return (
      <main>
        {/* แสดงฟอร์ม Login */}
        <LoginForm />
        
        {/* --- 2. เพิ่มลิงก์ไปหน้า Register --- */}
        <div className="text-center mt-4">
            Don't have an account? <Link href="/register" className="text-blue-500 hover:underline font-semibold">Register here</Link>
        </div>
      </main>
    );
  }

  // แสดง Loading ขณะกำลัง Redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}