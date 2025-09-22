'use client';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const handleWhatsAppOrder = () => {
    const phoneNumber = "201009720967";
    const message = `أريد شراء ${product.name}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div 
      className="product-card"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
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
        <span className="rating-count">({product.rating})</span>
      </div>
      
      <div className="product-price">{"EGP " + product.price}</div>
      
      {product.save && (
        <div className="price-save">وفر {product.save}</div>
      )}
      
      <p className="product-description">{product.description}</p>
      
      {product.shipping && (
        <div className="shipping">{product.shipping}</div>
      )}
      
      <div className="product-footer">
        <motion.button
          className="order-button"
          onClick={handleWhatsAppOrder}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="whatsapp-icon">📱</span> اطلب على الواتساب
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;