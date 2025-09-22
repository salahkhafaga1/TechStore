'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

// بيانات افتراضية إذا لم توجد بيانات محفوظة
const defaultProducts = [
  {
    id: 1,
    name: "AirPods Pro 3 - أحدث موديل",
    price: "3,000",
    description: "جودة صوت رائعة مع عزل ضوضاء متقدم",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400",
    rating: 124,
    save: "EGP 500",
    shipping: "شحن مجاني",
    category: "airpods"
  },
  {
    id: 2, 
    name: "Headphone Gaming Pro", 
    price: "1,500",
    description: "مثالي للألعاب والاستماع بجودة صوت استثنائية",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
    rating: 89,
    save: "EGP 200",
    shipping: "توصيل سريع",
    category: "headphones"
  },
  {
    id: 3,
    name: "ساعة ذكية 2024 - تتبع الصحة",
    price: "2,200",
    description: "تتبع اللياقة البدنية والصحة بدقة عالية", 
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    rating: 156,
    shipping: "شحن مجاني",
    category: "watches"
  }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // جلب البيانات من localStorage عند تحميل الصفحة
  useEffect(() => {
    const savedProducts = localStorage.getItem('storeProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // إذا لا توجد بيانات محفوظة، استخدم البيانات الافتراضية
      setProducts(defaultProducts);
      localStorage.setItem('storeProducts', JSON.stringify(defaultProducts));
    }
  }, []);

  const categories = [
    { id: 'all', name: 'جميع المنتجات', icon: '🏠' },
    { id: 'airpods', name: 'الإيربودز', icon: '🎧' },
    { id: 'headphones', name: 'الهيدفون', icon: '🎮' },
    { id: 'watches', name: 'الساعات', icon: '⌚' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className='pans'>🎮 TechStore</h1>
              <p className='pans'>أحدث المنتجات التكنولوجية</p>
            </div>
            
            <div className="animated-icons">
              <span className="icon">🎧</span>
              <span className="icon">🎮</span>
              <span className="icon">⌚</span>
            </div>
          </div>
        </div>
      </header>

      {/* قسم التصنيفات */}
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

      {/* Main Content */}
      <main className="container">
        {filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <h3>لا توجد منتجات حالياً</h3>
            <p>قم بإضافة منتجات من لوحة التحكم</p>
            <a href="/admin" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
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

      {/* Footer */}
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