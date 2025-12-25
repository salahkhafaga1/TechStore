'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ProductCard = ({ product }) => {
  const handleWhatsAppOrder = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const phoneNumber = "201009720967";
    const message = `أريد شراء ${product.name}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const hasDiscount = product.originalPrice && 
                     parseFloat(product.originalPrice) > parseFloat(product.price);
  
  const discountPercentage = hasDiscount ? 
    Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / 
                parseFloat(product.originalPrice)) * 100) : 0;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div 
        className="product-card"
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        style={{ position: 'relative' }}
      >
        {/* شارة العرض إذا كان هناك خصم */}
        {hasDiscount && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#b12704',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            zIndex: '10'
          }}>
            خصم {discountPercentage}%
          </div>
        )}

        {/* مؤقت العرض إذا كان متوفر */}
        {product.discountEnd && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ffa41c',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            zIndex: '10'
          }}>
            ⏰ {product.discountEnd}
          </div>
        )}

        <div className="product-image">
          <img 
            src={product.image} 
            alt={product.name}
            className="product-img"
          />
        </div>
        
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-count">({product.rating || 0})</span>
        </div>
        
        {/* عرض الأسعار */}
        <div style={{ marginBottom: '8px' }}>
          {hasDiscount ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold', 
                  color: '#b12704' 
                }}>
                  {product.price} ج.م
                </span>
                <span style={{
                  fontSize: '1rem',
                  color: '#666',
                  textDecoration: 'line-through'
                }}>
                  {product.originalPrice} ج.م
                </span>
              </div>
              <div style={{ 
                color: '#b12704', 
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                وفر {discountPercentage}%
              </div>
            </>
          ) : (
            <div style={{ 
              fontSize: '1.6rem', 
              fontWeight: 'bold', 
              color: '#b12704',
              marginBottom: '8px'
            }}>
              {product.price} ج.م
            </div>
          )}
        </div>
        
        <p className="product-description" style={{ height: '2.8em', overflow: 'hidden' }}>
          {product.description ? 
            (product.description.length > 60 ? 
              `${product.description.substring(0, 60)}...` : 
              product.description) 
            : 'لا يوجد وصف'}
        </p>
        
        {product.shipping && (
          <div className="shipping" style={{ marginBottom: '10px' }}>🚚 {product.shipping}</div>
        )}
        
        <div className="product-footer">
          <motion.button
            className="order-button"
            onClick={handleWhatsAppOrder}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: '#ffd814',
              color: '#0f1111',
              padding: '10px',
              border: '1px solid #fcd200',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              width: '100%'
            }}
          >
            <span>📱</span>
            اطلب الآن
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;