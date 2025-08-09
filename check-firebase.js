// Firebase Connection Test Script
// Run this in your browser console to test Firebase connectivity

console.log('🔍 Testing Firebase Connection...');

// Check if Firebase is initialized
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase SDK loaded');
} else {
  console.log('❌ Firebase SDK not loaded');
}

// Check environment variables (client-side only)
console.log('📋 Environment Check:');
console.log('- NEXT_PUBLIC_FIREBASE_API_KEY:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Test Firestore connection
async function testFirestore() {
  try {
    const { db } = await import('./src/lib/firebase.js');
    console.log('✅ Firestore database object available');
    
    // Try to read from projects collection
    const { collection, getDocs } = await import('firebase/firestore');
    const projectsRef = collection(db, 'projects');
    console.log('✅ Projects collection reference created');
    
    return 'Firestore connection test completed';
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return 'Firestore test failed';
  }
}

// Run the test
testFirestore().then(result => console.log(result)); 