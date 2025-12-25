'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/firebase';

export default function Home() {
  // 1. تعريف الأقسام الأساسية
  const defaultCategories = [
    { id: 'all', name: '🏠 جميع المنتجات', value: 'all' },
    { id: 'airpods', name: '🎧 الإيربودز', value: 'airpods' },
    { id: 'headphones', name: '🎮 الهيدفون', value: 'headphones' },
    { id: 'watches', name: '⌚ الساعات', value: 'watches' },
    { id: 'others', name: '✨ أخرى', value: 'أخرى' }
  ];

  // 2. تعريف الحالات (State)
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(defaultCategories);

  // 3. جلب الأقسام المخصصة
  useEffect(() => {
    const loadCustomCategories = () => {
      const savedCategories = localStorage.getItem('storeCategories');
      if (savedCategories) {
        try {
          const customCats = JSON.parse(savedCategories);
          const formattedCats = customCats.map((cat, index) => {
            const icon = cat.match(/^[^\w\s]+/)?.[0] || '📌';
            const name = cat.replace(/^[^\w\s]+\s/, '');
            return {
              id: `custom-${index}-${Date.now()}`,
              name: `${icon} ${name}`,
              value: name
            };
          });
          setCategories([...defaultCategories, ...formattedCats]);
        } catch (e) {
          console.error("Error parsing categories", e);
        }
      }
    };
    loadCustomCategories();
  }, []);

  // 4. جلب المنتجات
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // 5. الفلترة
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => {
        if (!product.category) return false;
        return product.category.toLowerCase() === activeCategory.toLowerCase();
      });

  // ✅ 6. شاشة التحميل (لازم تكون هنا قبل الـ return اللي تحت)
  if (loading) {
    return (
      <div className="loader-container">
        <div className="tech-spinner"></div>
        <div className="loading-text">
          <span style={{ fontSize: '1.5rem' }}>🎮</span>
          <span>جاري تجهيز المتجر...</span>
        </div>
        <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '10px' }}>
          أحدث التكنولوجيا بين يديك
        </p>
      </div>
    );
  }

  // ✅ 7. واجهة الموقع (تظهر بعد انتهاء التحميل)
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
                className={`category-tab ${activeCategory === category.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.value)}
              >
                <span className="category-icon">
                  {category.name.charAt(0)}
                </span>
                {category.name.substring(2)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h3>لا توجد منتجات حالياً في هذا القسم</h3>
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