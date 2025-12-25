'use client';
import { useState, useEffect } from 'react';
import { db, getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPanel() {
  // State
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Password Management
  const [currentAdminPassword, setCurrentAdminPassword] = useState('123456'); // القيمة الافتراضية
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', originalPrice: '', description: '',
    image: '', imageUrl: '', category: 'airpods',
    discountEnd: '', specifications: [], additionalImages: []
  });

  const [newCategory, setNewCategory] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('📱');
  const [customCategories, setCustomCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

  // أيقونات للأقسام
  const categoryIcons = [
    { value: '📱', label: 'إلكترونيات' }, { value: '🎧', label: 'صوتيات' },
    { value: '⌚', label: 'ساعات' }, { value: '🎮', label: 'ألعاب' },
    { value: '💻', label: 'كمبيوتر' }, { value: '🔋', label: 'بطاريات' },
    { value: '✨', label: 'أخرى' }
  ];

  // 1. تشغيل عند البدء (تحميل الباسورد والأقسام)
  useEffect(() => {
    setIsClient(true);
    
    // استرجاع الأقسام
    const savedCategories = localStorage.getItem('storeCategories');
    if (savedCategories) setCustomCategories(JSON.parse(savedCategories));

    // استرجاع الباسورد المحفوظ
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword) {
      setCurrentAdminPassword(savedPassword);
    }
  }, []);

  // حفظ الأقسام
  useEffect(() => {
    localStorage.setItem('storeCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  // جلب المنتجات Real-time
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id, ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  // --- دوال الصور ---
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
      if (file.size > 5 * 1024 * 1024) return alert('حجم الصورة كبير جداً! الحد الأقصى 5MB');
      try {
        const base64Image = await convertImageToBase64(file);
        setNewProduct({ ...newProduct, image: base64Image, imageUrl: URL.createObjectURL(file) });
      } catch (error) { alert('حدث خطأ أثناء رفع الصورة!'); }
    }
  };

  // --- دوال الأقسام ---
  const addNewCategory = () => {
    if (newCategory.trim()) {
      const categoryWithIcon = `${categoryIcon} ${newCategory.trim()}`;
      setCustomCategories([...customCategories, categoryWithIcon]);
      setNewProduct({ ...newProduct, category: newCategory.trim() });
      setNewCategory('');
      alert(`✅ تم إضافة قسم: ${newCategory.trim()}`);
    }
  };

  const removeCategory = (categoryToRemove) => {
    if (confirm(`حذف القسم "${categoryToRemove}"؟`)) {
      setCustomCategories(customCategories.filter(cat => cat !== categoryToRemove));
    }
  };

  // --- دوال تسجيل الدخول وتغيير الباسورد ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === currentAdminPassword) {
      setIsLoggedIn(true);
    } else {
      alert('كلمة المرور خاطئة!');
    }
  };

  const handleChangePassword = () => {
    if (!newPasswordInput || newPasswordInput.length < 4) {
      alert('يجب أن تكون كلمة المرور 4 أحرف على الأقل');
      return;
    }
    localStorage.setItem('adminPassword', newPasswordInput);
    setCurrentAdminPassword(newPasswordInput);
    setNewPasswordInput('');
    alert('✅ تم تغيير كلمة المرور بنجاح! احفظها جيداً.');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPassword('');
  };

  // --- دوال المنتجات ---
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) return alert('أكمل البيانات والصورة!');
    try {
      setLoading(true);
      const productData = {
        ...newProduct,
        category: newProduct.category || 'أخرى',
        createdAt: new Date().toISOString()
      };

      if (isEditing !== null) {
        await updateProduct(isEditing, productData);
        alert('تم التعديل!');
      } else {
        await addProduct(productData);
        alert('تم الإضافة!');
      }
      // Reset Form
      setNewProduct({ 
        name: '', price: '', originalPrice: '', description: '', 
        image: '', imageUrl: '', category: 'airpods', discountEnd: '', specifications: [], additionalImages: [] 
      });
      setIsEditing(null);
    } catch (error) { alert('خطأ في الحفظ!'); } finally { setLoading(false); }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name, price: product.price, originalPrice: product.originalPrice || '',
      description: product.description || '', image: product.image, imageUrl: product.image,
      category: product.category || 'airpods', discountEnd: product.discountEnd || '',
      specifications: product.specifications || [], additionalImages: product.additionalImages || []
    });
    setIsEditing(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('حذف المنتج نهائياً؟')) {
      await deleteProduct(id);
    }
  };

  // استخراج اسم القسم
  const extractCategoryName = (cat) => cat.replace(/^[^\w\s]+\s/, '');

  // --- واجهة تسجيل الدخول ---
  if (!isLoggedIn) {
    if (!isClient) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>🔐 دخول المدير</h2>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '2px solid #ddd', borderRadius: '5px' }} />
            <button type="submit" style={{ width: '100%', background: '#667eea', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>دخول</button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
            {currentAdminPassword === '123456' ? 'كلمة المرور الافتراضية: 123456' : 'تم تغيير كلمة المرور يدوياً'}
          </div>
        </div>
      </div>
    );
  }

  // --- لوحة التحكم ---
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ color: '#333', margin: 0, fontSize: '1.5rem' }}>🛠️ لوحة التحكم {loading && '⏳'}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" style={{ textDecoration: 'none', padding: '8px 15px', background: '#667eea', color: 'white', borderRadius: '5px' }}>🏠 الموقع</Link>
            <button onClick={logout} style={{ background: '#ff6b6b', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>تسجيل خروج</button>
          </div>
        </div>

        {/* قسم تغيير كلمة المرور */}
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🔐 إعدادات الأمان</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="تعيين كلمة مرور جديدة" 
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
            />
            <button 
              onClick={handleChangePassword}
              style={{ background: '#856404', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
            >
              حفظ كلمة المرور الجديدة
            </button>
          </div>
        </div>

        {/* Form إضافة منتج */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>{isEditing !== null ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h3>
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            
            {/* الحقول الأساسية */}
            <input type="text" placeholder="اسم المنتج *" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="السعر (ج.م) *" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="السعر الأصلي (للخصم)" value={newProduct.originalPrice} onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })} style={inputStyle} />
            
            {/* رفع الصورة */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>صورة المنتج *</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={inputStyle} />
            </div>

            {/* اختيار القسم */}
            <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={inputStyle}>
              <option value="">-- اختر القسم --</option>
              <optgroup label="أساسي">
                <option value="airpods">🎧 الإيربودز</option>
                <option value="headphones">🎮 الهيدفون</option>
                <option value="watches">⌚ الساعات</option>
                <option value="أخرى">✨ أخرى</option>
              </optgroup>
              {customCategories.length > 0 && (
                <optgroup label="مخصص">
                  {customCategories.map((cat, i) => <option key={i} value={extractCategoryName(cat)}>{cat}</option>)}
                </optgroup>
              )}
            </select>

            <input type="text" placeholder="تاريخ انتهاء العرض (مثال: قريباً)" value={newProduct.discountEnd} onChange={(e) => setNewProduct({ ...newProduct, discountEnd: e.target.value })} style={inputStyle} />
            
            {/* الوصف والمواصفات */}
            <textarea placeholder="وصف المنتج" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: '80px' }} />
            <textarea placeholder="المواصفات (كل سطر مواصفة)" value={newProduct.specifications.join('\n')} onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value.split('\n') })} style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: '80px' }} />

            {/* معاينة الصورة */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {newProduct.imageUrl && <img src={newProduct.imageUrl} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '5px' }} />}
          </div>

          {/* إدارة الأقسام */}
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
            <h5 style={{ margin: '0 0 10px 0' }}>📂 إضافة قسم جديد</h5>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)} style={{ padding: '8px', fontSize: '1.2rem' }}>
                {categoryIcons.map((ic, i) => <option key={i} value={ic.value}>{ic.value}</option>)}
              </select>
              <input type="text" placeholder="اسم القسم" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ flex: 1, padding: '8px' }} />
              <button onClick={addNewCategory} style={{ background: '#48bb78', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>إضافة</button>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {customCategories.map((cat, i) => (
                <span key={i} style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '15px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {cat} <span onClick={() => removeCategory(cat)} style={{ cursor: 'pointer', color: 'red', fontWeight: 'bold' }}>×</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={handleAddProduct} disabled={loading} style={{ background: loading ? '#ccc' : '#48bb78', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? '⏳...' : (isEditing !== null ? '💾 حفظ التعديلات' : '➕ إضافة المنتج')}
            </button>
            {isEditing && <button onClick={() => { setIsEditing(null); setNewProduct({ name: '', price: '', originalPrice: '', description: '', image: '', imageUrl: '', category: 'airpods', discountEnd: '', specifications: [], additionalImages: [] }); }} style={{ background: '#ccc', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>❌ إلغاء</button>}
          </div>
        </div>

        {/* قائمة المنتجات */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ marginBottom: '20px' }}>📦 المنتجات ({products.length})</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {products.map((p) => (
              <div key={p.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{p.price} ج.م | {p.category}</div>
                  </div>
                </div>
                <div>
                  <button onClick={() => handleEditProduct(p)} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', marginLeft: '5px', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' };