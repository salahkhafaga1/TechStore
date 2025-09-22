'use client';
import { useState } from 'react';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: null, // تغيير من string إلى null
    imageUrl: '', // للعرض فقط
    category: 'airpods'
  });

  const [isEditing, setIsEditing] = useState(null);

  const ADMIN_PASSWORD = 'salah2004';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      const savedProducts = localStorage.getItem('storeProducts');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } else {
      alert('كلمة المرور خاطئة!');
    }
  };

  // دالة لتحويل الصورة إلى base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // التحقق من نوع الصورة
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة فقط!');
        return;
      }

      // التحقق من حجم الصورة (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً! الحد الأقصى 5MB');
        return;
      }

      try {
        const base64Image = await convertImageToBase64(file);
        setNewProduct({
          ...newProduct,
          image: base64Image,
          imageUrl: URL.createObjectURL(file) // لعرض معاينة الصورة
        });
      } catch (error) {
        alert('حدث خطأ أثناء رفع الصورة!');
      }
    }
  };

  const saveProducts = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('storeProducts', JSON.stringify(updatedProducts));
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('الرجاء ملء جميع الحقول المطلوبة وإضافة صورة!');
      return;
    }

    let updatedProducts;
    
    if (isEditing !== null) {
      updatedProducts = products.map((p, i) => 
        i === isEditing ? { ...newProduct, id: p.id } : p
      );
      setIsEditing(null);
    } else {
      updatedProducts = [...products, { 
        ...newProduct, 
        id: Date.now(),
        rating: Math.floor(Math.random() * 100) + 50,
        save: Math.random() > 0.5 ? `EGP ${Math.floor(Math.random() * 500) + 100}` : '',
        shipping: Math.random() > 0.3 ? 'شحن مجاني' : 'توصيل سريع'
      }];
    }
    
    saveProducts(updatedProducts);
    setNewProduct({ 
      name: '', 
      price: '', 
      description: '', 
      image: null, 
      imageUrl: '', 
      category: 'airpods' 
    });
    alert(isEditing !== null ? 'تم تعديل المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');
  };

  const editProduct = (index) => {
    const productToEdit = products[index];
    setNewProduct({
      ...productToEdit,
      imageUrl: productToEdit.image // إذا كانت الصورة base64
    });
    setIsEditing(index);
  };

  const deleteProduct = (index) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updatedProducts = products.filter((_, i) => i !== index);
      saveProducts(updatedProducts);
      alert('تم حذف المنتج بنجاح!');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            🔐 دخول المدير
          </h2>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                marginBottom: '20px',
                fontSize: '16px'
              }}
            />
            
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#667eea',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              دخول
            </button>
          </form>
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#666',
            fontSize: '14px'
          }}>
            
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#333', margin: 0 }}>
            🛠️ لوحة تحكم المدير
          </h1>
          
          <button
            onClick={logout}
            style={{
              background: '#ff6b6b',
              color: 'white',
              padding: '8px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            تسجيل خروج
          </button>
        </div>

        {/* نموذج إضافة/تعديل المنتج */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px', 
          marginBottom: '30px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>
            {isEditing !== null ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gap: '15px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                اسم المنتج *
              </label>
              <input
                type="text"
                placeholder="مثال: AirPods Pro 3"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px' 
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                السعر (ج.م) *
              </label>
              <input
                type="text"
                placeholder="مثال: 3000"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px' 
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                رفع صورة المنتج *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px' 
                }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                الصيغ المدعومة: JPG, PNG, GIF - الحد الأقصى: 5MB
              </small>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                القسم
              </label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px' 
                }}
              >
                <option value="airpods">🎧 الإيربودز</option>
                <option value="headphones">🎮 الهيدفون</option>
                <option value="watches">⌚ الساعات</option>
              </select>
            </div>
            
            {/* معاينة الصورة */}
            {newProduct.imageUrl && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
                  معاينة الصورة:
                </label>
                <img 
                  src={newProduct.imageUrl} 
                  alt="معاينة" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '150px', 
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            )}
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                وصف المنتج
              </label>
              <textarea
                placeholder="وصف مختصر عن المنتج..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  minHeight: '80px' 
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={addProduct}
              style={{
                background: '#48bb78',
                color: 'white',
                padding: '12px 25px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isEditing !== null ? '💾 حفظ التعديلات' : '➕ إضافة المنتج'}
            </button>
            
            {isEditing !== null && (
              <button
                onClick={() => {
                  setIsEditing(null);
                  setNewProduct({ 
                    name: '', 
                    price: '', 
                    description: '', 
                    image: null, 
                    imageUrl: '', 
                    category: 'airpods' 
                  });
                }}
                style={{
                  background: '#ccc',
                  color: '#333',
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ❌ إلغاء
              </button>
            )}
          </div>
        </div>

        {/* قائمة المنتجات */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>
            📦 إدارة المنتجات ({products.length} منتج)
          </h3>
          
          {products.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              لا توجد منتجات حتى الآن. ابدأ بإضافة منتجك الأول!
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {products.map((product, index) => (
                <div key={product.id} style={{
                  border: '1px solid #e2e8f0',
                  padding: '15px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover',
                        borderRadius: '5px'
                      }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{product.name}</h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        {product.price} ج.م | {product.category}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => editProduct(index)}
                      style={{
                        background: '#3182ce',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      ✏️ تعديل
                    </button>
                    
                    <button
                      onClick={() => deleteProduct(index)}
                      style={{
                        background: '#e53e3e',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}