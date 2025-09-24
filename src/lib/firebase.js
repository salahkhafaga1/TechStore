import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// بيانات التكوين من Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyC0WIcyjnzbtNImoayYoaolTgTMwZnkHdM",
  authDomain: "my-tech-store-web.firebaseapp.com",
  projectId: "my-tech-store-web",
  storageBucket: "my-tech-store-web.firebasestorage.app",
  messagingSenderId: "547057505241",
  appId: "1:547057505241:web:a92a7931f3bee1b91cffc8",
  measurementId: "G-X0HMXWPFC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// دوال للتعامل مع المنتجات
export const getProducts = async () => {
  try {
    console.log('🔍 جاري جلب المنتجات من Firebase...');
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    console.log('✅ عدد المنتجات المستلمة:', productSnapshot.size);
    
    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📦 المنتجات:', productList);
    return productList;
  } catch (error) {
    console.error('❌ خطأ في جلب المنتجات:', error);
    return [];
  }
};

export const addProduct = async (product) => {
  try {
    console.log('➕ جاري إضافة منتج جديد:', product.name);
    const productsCol = collection(db, 'products');
    const docRef = await addDoc(productsCol, product);
    console.log('✅ تم إضافة المنتج بنجاح، الـ ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إضافة المنتج:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    console.log('✏️ جاري تعديل المنتج:', id);
    const productDoc = doc(db, 'products', id);
    await updateDoc(productDoc, product);
    console.log('✅ تم تعديل المنتج بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تعديل المنتج:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    console.log('🗑️ جاري حذف المنتج:', id);
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
    console.log('✅ تم حذف المنتج بنجاح');
  } catch (error) {
    console.error('❌ خطأ في حذف المنتج:', error);
    throw error;
  }
};

// دالة مساعدة للتحقق من الاتصال
export const testConnection = async () => {
  try {
    console.log('🔗 فحص اتصال Firebase...');
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    console.log('✅ الاتصال ناجح، عدد المستندات:', snapshot.size);
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال:', error);
    return false;
  }
};

// دالة للعمل في وضع Offline إذا فشل الاتصال
export const getProductsWithFallback = async () => {
  try {
    const onlineProducts = await getProducts();
    if (onlineProducts.length > 0) {
      return onlineProducts;
    }
    
    // بيانات افتراضية إذا لم توجد بيانات
    const defaultProducts = [
      {
        id: 'offline-1',
        name: "AirPods Pro - تجريبي",
        price: "2,500",
        description: "منتج تجريبي - اتصال غير متوفر",
        image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400",
        category: "airpods",
        rating: 50,
        shipping: "شحن مجاني"
      }
    ];
    
    return defaultProducts;
  } catch (error) {
    console.error('❌ استخدام البيانات الافتراضية بسبب خطأ:', error);
    
    const defaultProducts = [
      {
        id: 'offline-1',
        name: "AirPods Pro - وضع عدم الاتصال",
        price: "2,500",
        description: "جودة صوت رائعة - اتصال غير متوفر",
        image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400",
        category: "airpods",
        rating: 50,
        shipping: "شحن مجاني"
      }
    ];
    
    return defaultProducts;
  }
};