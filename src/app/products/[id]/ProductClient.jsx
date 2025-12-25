'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProductClient() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setMainImage(data.image);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleOrder = () => {
    if (!product) return;
    const phoneNumber = "201009720967";
    const message = `مرحبا، أريد طلب المنتج: ${product.name}\nالسعر: ${product.price} ج.م\nالرابط: ${window.location.href}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const hasDiscount = product?.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount ? 
    Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100) : 0;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="tech-spinner"></div>
        <div className="loading-text">
          <span>جاري جلب التفاصيل...</span>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>❌ المنتج غير موجود</h2>
      <Link href="/" style={{ color: '#667eea', textDecoration: 'underline' }}>العودة للرئيسية</Link>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
      <div className="container" style={{ padding: '20px' }}>
        <button onClick={() => router.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>
          ⬅️ رجوع
        </button>
      </div>

      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '40px',
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
        }}>
          
          <div className="product-gallery">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                border: '1px solid #eee', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                marginBottom: '15px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px'
              }}
            >
              <img 
                src={mainImage} 
                alt={product.name} 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
              />
            </motion.div>
            
            {product.additionalImages && product.additionalImages.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                <img 
                  src={product.image} 
                  onClick={() => setMainImage(product.image)}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: mainImage === product.image ? '2px solid #667eea' : '1px solid #ddd' }}
                />
                {product.additionalImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    onClick={() => setMainImage(img)}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: mainImage === img ? '2px solid #667eea' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div style={{ marginBottom: '10px', color: '#667eea', fontWeight: 'bold' }}>
              {product.category}
            </div>
            
            <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#333' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b12704' }}>
                {product.price} ج.م
              </span>
              {hasDiscount && (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.2rem' }}>
                    {product.originalPrice} ج.م
                  </span>
                  <span style={{ background: '#b12704', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem' }}>
                    خصم {discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {product.discountEnd && (
              <div style={{ 
                background: '#fff8e1', 
                border: '1px solid #ffe58f', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                color: '#d48806',
                display: 'inline-block'
              }}>
                🔥 العرض ينتهي في: <b>{product.discountEnd}</b>
              </div>
            )}

            <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '30px', whiteSpace: 'pre-line' }}>
              {product.description}
            </p>

            {product.specifications && product.specifications.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>📌 المواصفات:</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {product.specifications.map((spec, index) => (
                    <li key={index} style={{ 
                      marginBottom: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      color: '#444' 
                    }}>
                      <span style={{ color: '#48bb78' }}>✓</span> {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <motion.button
              onClick={handleOrder}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: '#25D366',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
              }}
            >
              <span>📱</span> اطلب الآن عبر واتساب
            </motion.button>
            
            <p style={{ textAlign: 'center', marginTop: '10px', color: '#888', fontSize: '0.9rem' }}>
              توصيل سريع 🚚 | دفع عند الاستلام 💵
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}