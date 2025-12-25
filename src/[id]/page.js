'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', params.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          setProduct({
            id: productSnap.id,
            ...productSnap.data()
          });
        } else {
          console.log('المنتج غير موجود');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleWhatsAppOrder = () => {
    if (!product) return;
    
    const phoneNumber = "201009720967";
    const message = `أريد شراء ${product.name} - الكمية: ${quantity} - السعر: ${product.price} ج.م`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>⏳ جاري تحميل المنتج...</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>المنتج غير موجود</h2>
          <button 
            onClick={() => router.push('/')} 
            style={{ 
              marginTop: '20px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount ? 
    Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header className="header" style={{ marginBottom: '20px' }}>
        <div className="container">
          <div className="header-content">
            <h1>🛍️ {product.name}</h1>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '20px 0' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '40px',
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* معرض الصور */}
          <div>
            <div style={{ 
              width: '100%', 
              height: '400px', 
              overflow: 'hidden', 
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fafafa'
            }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain' 
                }}
              />
            </div>
          </div>

          {/* تفاصيل المنتج */}
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#333' }}>
              {product.name}
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
              <span style={{ 
                background: '#f0f0f0', 
                padding: '5px 10px', 
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                📍 {product.category}
              </span>
            </div>

            {/* التقييم */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#ffa41c', fontSize: '1.2rem' }}>★★★★★</span>
              <span style={{ marginLeft: '10px', color: '#666' }}>({product.rating || 0} تقييم)</span>
            </div>

            {/* الأسعار */}
            <div style={{ marginBottom: '30px' }}>
              {hasDiscount ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <span style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 'bold', 
                      color: '#b12704' 
                    }}>
                      {product.price} ج.م
                    </span>
                    <span style={{ 
                      fontSize: '1.8rem', 
                      color: '#666',
                      textDecoration: 'line-through'
                    }}>
                      {product.originalPrice} ج.م
                    </span>
                    <span style={{ 
                      background: '#b12704',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontWeight: 'bold'
                    }}>
                      خصم {discountPercentage}%
                    </span>
                  </div>
                  {product.discountEnd && (
                    <p style={{ color: '#b12704', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ⏰ العرض ينتهي في: {product.discountEnd}
                    </p>
                  )}
                </>
              ) : (
                <span style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: '#b12704' 
                }}>
                  {product.price} ج.م
                </span>
              )}
            </div>

            {/* معلومات الشحن */}
            {product.shipping && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                <p style={{ margin: 0, color: '#666', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>🚚</span>
                  {product.shipping}
                </p>
              </div>
            )}

            {/* الكمية */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                الكمية:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{ 
                  width: '60px', 
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* زر الشراء */}
            <button
              onClick={handleWhatsAppOrder}
              style={{
                width: '100%',
                background: '#ffd814',
                color: '#0f1111',
                padding: '15px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span>📱</span>
              اطلب على الواتساب
            </button>

            {/* تفاصيل إضافية */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>📋 تفاصيل المنتج</h3>
              <p style={{ 
                color: '#666', 
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {product.description || 'لا توجد تفاصيل إضافية.'}
              </p>
              
              {/* مواصفات إضافية */}
              {product.specifications && product.specifications.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>⚙️ المواصفات</h4>
                  <ul style={{ paddingLeft: '20px', color: '#666' }}>
                    {product.specifications.map((spec, index) => (
                      <li key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                        • {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: '40px' }}>
        <div className="container">
          <p>© 2024 TechStore. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}