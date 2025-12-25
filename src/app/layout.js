// 1. استدعاء الخط من جوجل
import { Cairo } from "next/font/google";
import "./globals.css";

// 2. إعداد الخط
const cairo = Cairo({ 
  subsets: ["arabic"], 
  weight: ["400", "700"], // أوزان الخط (عادي وعريض)
  variable: "--font-cairo", // عشان نستخدمه في أي مكان
});

export const metadata = {
  // 3. هنا غير اسم الموقع اللي بيظهر في التبويب فوق
  title: "متجر حسام الدين",
  description: "أفضل المنتجات بأسعار مميزة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl"> {/* خليت اللغة عربي والاتجاه يمين */}
      <body className={cairo.className}>
        {children}
      </body>
    </html>
  );
}