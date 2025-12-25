import { getProducts } from '@/lib/firebase';
import ProductClient from './ProductClient'; // بنستدعي ملف الواجهة اللي عملناه فوق

// الدالة دي بتشتغل على السيرفر بس عشان تجهز الروابط
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

// دي الصفحة الرئيسية اللي بتعرض الواجهة
export default function ProductPage() {
  return <ProductClient />;
}