'use client';
import { useState, useEffect } from 'react';
import { db, getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    imageUrl: '',
    category: 'airpods',
    discountEnd: '',
    specifications: [],
    additionalImages: []
  });

  const [newCategory, setNewCategory] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('📱');
  const [customCategories, setCustomCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  const ADMIN_PASSWORD = 'Ho';

  // أيقونات للأقسام
  const categoryIcons = [
    { value: '📱', label: 'إلكترونيات' },
    { value: '🎧', label: 'صوتيات' },
    { value: '⌚', label: 'ساعات' },
    { value: '🎮', label: 'ألعاب' },
    { value: '💻', label: 'كمبيوتر' },
    { value: '🔋', label: 'بطاريات' },
    { value: '📷', label: 'كاميرات' },
    { value: '🎵', label: 'موسيقى' },
    { value: '⚡', label: 'إكسسوارات' },
    { value: '✨', label: 'أخرى' },
    { value: '🛒', label: 'تسوق' },
    { value: '🎁', label: 'هدايا' },
    { value: '👕', label: 'ملابس' },
    { value: '👟', label: 'أحذية' },
    { value: '👜', label: 'حقائب' },
    { value: '💎', label: 'مجوهرات' }
  ];

  useEffect(() => {
    setIsClient(true);
    
    // استرجاع الأقسام المحفوظة
    const savedCategories = localStorage.getItem('storeCategories');
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }
  }, []);

  // حفظ الأقسام عند التغيير
  useEffect(() => {
    localStorage.setItem('storeCategories', JSON.stringify(customCategories));
  }, [customCategories]);

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
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة فقط!');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً! الحد الأقصى 5MB');
        return;
      }

      try {
        const base64Image = await convertImageToBase64(file);
        setNewProduct({
          ...newProduct,
          image: base64Image,
          imageUrl: URL.createObjectURL(file)
        });
      } catch (error) {
        alert('حدث خطأ أثناء رفع الصورة!');
      }
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim()) {
      // تحقق إذا القسم موجود بالفعل
      const categoryExists = customCategories.some(cat => 
        cat.toLowerCase().includes(newCategory.trim().toLowerCase())
      );
      
      if (categoryExists) {
        alert('⚠️ هذا القسم موجود بالفعل!');
        return;
      }

      const categoryWithIcon = `${categoryIcon} ${newCategory.trim()}`;
      setCustomCategories([...customCategories, categoryWithIcon]);
      setNewProduct({ ...newProduct, category: newCategory.trim() });
      setNewCategory('');
      setCategoryIcon('📱');
      alert(`✅ تم إضافة قسم جديد: ${newCategory.trim()}`);
    }
  };

  const removeCategory = (categoryToRemove) => {
    if (confirm(`هل تريد حذف القسم "${categoryToRemove}"؟\nملاحظة: المنتجات المرتبطة بهذا القسم ستظهر في قسم "أخرى"`)) {
      const updatedCategories = customCategories.filter(cat => cat !== categoryToRemove);
      setCustomCategories(updatedCategories);
      alert(`🗑️ تم حذف القسم: ${categoryToRemove}`);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert('كلمة المرور خاطئة!');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('الرجاء ملء جميع الحقول المطلوبة وإضافة صورة!');
      return;
    }

    // إذا لم يتم اختيار قسم، استخدم "أخرى"
    if (!newProduct.category) {
      setNewProduct({ ...newProduct, category: 'أخرى' });
    }

    try {
      setLoading(true);
      const productData = {
        name: newProduct.name,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice || null,
        description: newProduct.description,
        image: newProduct.image,
        category: newProduct.category || 'أخرى',
        discountEnd: newProduct.discountEnd || null,
        specifications: newProduct.specifications || [],
        additionalImages: newProduct.additionalImages || [],
        rating: Math.floor(Math.random() * 100) + 50,
        shipping: Math.random() > 0.3 ? 'شحن مجاني' : 'توصيل سريع',
        createdAt: new Date().toISOString()
      };

      if (isEditing !== null) {
        await updateProduct(isEditing, productData);
        alert('تم تعديل المنتج بنجاح!');
      } else {
        await addProduct(productData);
        alert('تم إضافة المنتج بنجاح!');
      }

      setNewProduct({ 
        name: '', 
        price: '', 
        originalPrice: '',
        description: '', 
        image: '', 
        imageUrl: '', 
        category: 'airpods',
        discountEnd: '',
        specifications: [],
        additionalImages: []
      });
      setIsEditing(null);
    } catch (error) {
      alert('حدث خطأ أثناء حفظ المنتج!');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      description: product.description || '',
      image: product.image,
      imageUrl: product.image,
      category: product.category || 'airpods',
      discountEnd: product.discountEnd || '',
      specifications: product.specifications || [],
      additionalImages: product.additionalImages || []
    });
    setIsEditing(product.id);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        setLoading(true);
        await deleteProduct(id);
        alert('تم حذف المنتج بنجاح!');
      } catch (error) {
        alert('حدث خطأ أثناء حذف المنتج!');
      } finally {
        setLoading(false);
      }
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  // استخراج اسم القسم من النص (بعد الأيقونة)
  const extractCategoryName = (categoryWithIcon) => {
    return categoryWithIcon.replace(/^[^\w\s]+\s/, '');
  };

  if (!isLoggedIn) {
    if (!isClient) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <h2>⏳ جاري التحميل...</h2>
          </div>
        </div>
      );
    }

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
              suppressHydrationWarning
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
              suppressHydrationWarning
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
            كلمة المرور الافتراضية: 123456
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
            🛠️ لوحة تحكم المدير {loading && '⏳'}
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
                السعر الأصلي (للعروض)
              </label>
              <input
                type="text"
                placeholder="السعر قبل الخصم"
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
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
                اختر القسم *
              </label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- اختر قسم المنتج --</option>
                
                {/* الأقسام الأساسية */}
                <optgroup label="الأقسام الأساسية">
                  <option value="airpods">🎧 الإيربودز</option>
                  <option value="headphones">🎮 الهيدفون</option>
                  <option value="watches">⌚ الساعات</option>
                  <option value="أخرى">✨ أخرى</option>
                </optgroup>
                
                {/* الأقسام المخصصة */}
                {customCategories.length > 0 && (
                  <optgroup label="الأقسام المخصصة">
                    {customCategories.map((cat, index) => (
                      <option key={`custom-${index}`} value={extractCategoryName(cat)}>
                        {cat}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                تاريخ انتهاء العرض
              </label>
              <input
                type="text"
                placeholder="مثال: 31 ديسمبر 2024"
                value={newProduct.discountEnd}
                onChange={(e) => setNewProduct({ ...newProduct, discountEnd: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px' 
                }}
              />
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
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                المواصفات (كل مواصفة في سطر جديد)
              </label>
              <textarea
                placeholder="مواصفة 1\nمواصفة 2\nمواصفة 3"
                value={newProduct.specifications ? newProduct.specifications.join('\n') : ''}
                onChange={(e) => setNewProduct({ 
                  ...newProduct, 
                  specifications: e.target.value.split('\n').filter(spec => spec.trim()) 
                })}
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  minHeight: '80px' 
                }}
              />
            </div>

            {/* قسم إدارة الأقسام */}
            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '15px', borderBottom: '2px solid #667eea', paddingBottom: '5px' }}>
                🏷️ إدارة أقسام المنتجات
              </h4>
              
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                {/* إضافة قسم جديد */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ color: '#666', marginBottom: '10px' }}>➕ إضافة قسم جديد</h5>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    {/* اختيار الأيقونة */}
                    <div style={{ minWidth: '150px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>
                        اختر أيقونة:
                      </label>
                      <select
                        value={categoryIcon}
                        onChange={(e) => setCategoryIcon(e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px',
                          fontSize: '1.2rem'
                        }}
                      >
                        {categoryIcons.map((icon, index) => (
                          <option key={index} value={icon.value}>
                            {icon.value} {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* اسم القسم */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>
                        اسم القسم الجديد:
                      </label>
                      <input
                        type="text"
                        placeholder="أدخل اسم القسم الجديد..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '10px', 
                          border: '1px solid #ddd', 
                          borderRadius: '5px' 
                        }}
                      />
                    </div>
                    
                    {/* زر الإضافة */}
                    <div>
                      <button
                        type="button"
                        onClick={addNewCategory}
                        disabled={!newCategory.trim()}
                        style={{
                          padding: '10px 20px',
                          background: !newCategory.trim() ? '#ccc' : '#48bb78',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: !newCategory.trim() ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          height: '40px'
                        }}
                      >
                        إضافة قسم جديد
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* قائمة الأقسام الحالية */}
                <div>
                  <h5 style={{ color: '#666', marginBottom: '10px' }}>📋 الأقسام الحالية:</h5>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: '10px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: 'white',
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                  }}>
                    {/* الأقسام الأساسية */}
                    {['🎧 الإيربودز', '🎮 الهيدفون', '⌚ الساعات', '✨ أخرى'].map((cat, index) => (
                      <div key={`base-${index}`} style={{
                        padding: '10px',
                        background: '#e6f7ff',
                        borderRadius: '5px',
                        border: '1px solid #91d5ff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 'bold' }}>{cat}</span>
                        <span style={{ color: '#1890ff', fontSize: '0.8rem' }}>(أساسي)</span>
                      </div>
                    ))}
                    
                    {/* الأقسام المخصصة */}
                    {customCategories.map((cat, index) => (
                      <div key={`custom-${index}`} style={{
                        padding: '10px',
                        background: '#f6ffed',
                        borderRadius: '5px',
                        border: '1px solid #b7eb8f',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 'bold' }}>{cat}</span>
                        <button
                          onClick={() => removeCategory(cat)}
                          style={{
                            background: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                    
                    {customCategories.length === 0 && (
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '20px',
                        color: '#666'
                      }}>
                        لا توجد أقسام مخصصة حتى الآن. ابدأ بإضافة قسم جديد!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleAddProduct}
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#48bb78',
                color: 'white',
                padding: '12px 25px',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? '⏳ جاري الحفظ...' : (isEditing !== null ? '💾 حفظ التعديلات' : '➕ إضافة المنتج')}
            </button>
            
            {isEditing !== null && (
              <button
                onClick={() => {
                  setIsEditing(null);
                  setNewProduct({ 
                    name: '', 
                    price: '', 
                    originalPrice: '',
                    description: '', 
                    image: '', 
                    imageUrl: '', 
                    category: 'airpods',
                    discountEnd: '',
                    specifications: [],
                    additionalImages: []
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

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>
            📦 إدارة المنتجات ({products.length} منتج)
          </h3>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              ⏳ جاري تحميل المنتجات...
            </p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              لا توجد منتجات حتى الآن. ابدأ بإضافة منتجك الأول!
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {products.map((product) => (
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
                        {product.originalPrice && (
                          <span style={{ color: '#b12704', marginLeft: '10px' }}>
                            (خصم على {product.originalPrice} ج.م)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEditProduct(product)}
                      disabled={loading}
                      style={{
                        background: loading ? '#ccc' : '#3182ce',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      ✏️ تعديل
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={loading}
                      style={{
                        background: loading ? '#ccc' : '#e53e3e',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer',
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