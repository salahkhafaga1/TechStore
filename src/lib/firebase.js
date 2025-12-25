import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

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

// ✅ منع إعادة تهيئة Firebase في Next.js
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

/* ======================
   Products Functions
====================== */

export const getProducts = async () => {
  try {
    const productsCol = collection(db, "products");
    const snapshot = await getDocs(productsCol);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("❌ خطأ في جلب المنتجات:", error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) return null;

    return {
      id: productSnap.id,
      ...productSnap.data()
    };
  } catch (error) {
    console.error("❌ خطأ في جلب المنتج:", error);
    return null;
  }
};

export const addProduct = async (product) => {
  try {
    const productsCol = collection(db, "products");
    const docRef = await addDoc(productsCol, product);
    return docRef.id;
  } catch (error) {
    console.error("❌ خطأ في إضافة المنتج:", error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, product);
  } catch (error) {
    console.error("❌ خطأ في تعديل المنتج:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("❌ خطأ في حذف المنتج:", error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.size >= 0;
  } catch {
    return false;
  }
};
