'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/firebase';

// بيانات افتراضية إذا فشل الاتصال
const defaultProducts = [
  {
    id: 1,
    name: "AirPods Pro - وضع عدم الاتصال",
    price: "2,500",
    description: "جودة صوت رائعة - بيانات محلية",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400",
    category: "airpods",
    rating: 50,
    shipping: "شحن مجاني"
  }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🔄 محاولة الاتصال بـ Firebase...');
        const productsData = await getProducts();
        
        if (productsData.length > 0) {
          setProducts(productsData);
          setIsOnline(true);
        } else {
          // إذا مفيش بيانات، استخدم البيانات الافتراضية
          setProducts(defaultProducts);
          setIsOnline(false);
        }
      } catch (error) {
        console.error('❌ فشل الاتصال، استخدام البيانات المحلية');
        setProducts(defaultProducts);
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ... باقي الكود بدون تغيير

  const categories = [
    { id: 'all', name: 'جميع المنتجات', icon: '🏠' },
    { id: 'airpods', name: 'الإيربودز', icon: '🎧' },
    { id: 'headphones', name: 'الهيدفون', icon: '🎮' },
    { id: 'watches', name: 'الساعات', icon: '⌚' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>🎮 TechStore</h1>
              <p>أحدث المنتجات التكنولوجية</p>
            </div>
            <div className="animated-icons">
              <span className="icon">🎧</span>
              <span className="icon">🎮</span>
              <span className="icon">⌚</span>
            </div>
          </div>
        </div>
      </header>

      <section className="categories-section">
        <div className="container">
          <div className="categories-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h3>لا توجد منتجات حالياً</h3>
            <p>قم بإضافة منتجات من لوحة التحكم</p>
            <a href="/admin" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              الذهاب إلى لوحة التحكم
            </a>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2024 TechStore. جميع الحقوق محفوظة.</p>
          <p style={{ marginTop: '10px', fontSize: '0.7rem' }}>
            <a href="/admin" style={{ color: '#ffd814' }}>لوحة التحكم للمدير</a>
          </p>
        </div>
      </footer>
    </div>
  );
}