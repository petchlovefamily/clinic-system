// app/register/page.tsx
import RegisterForm from "@/components/RegisterForm"; // <-- นำเข้า Component

export default function RegisterPageWrapper() { // <-- เปลี่ยนชื่อเป็น Route Wrapper
    // ไม่จำเป็นต้องเป็น "use client" เพราะ Component ข้างในเป็น client อยู่แล้ว
    return (
        <RegisterForm />
    );
}