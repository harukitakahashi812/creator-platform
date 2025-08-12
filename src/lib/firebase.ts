import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, persistentSingleTabManager, getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase configuration. Please check your .env.local file.');
  console.error('Required variables:', {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
  });
} else {
  console.log('✅ Firebase configuration loaded successfully');
}

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Initialize Firestore with long-polling and persistent cache for better connectivity
  try {
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
      localCache: persistentSingleTabManager(),
      // Add timeout and retry settings for better connectivity
      ignoreUndefinedProperties: true,
    });
  } catch {
    // If already initialized, just get the existing instance
    db = getFirestore(app);
  }
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { auth, db };

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Firestore functions
export interface Project {
  id?: string;
  title: string;
  description: string;
  googleDriveLink: string;
  projectType: 'Elementor' | 'Graphic Design' | 'Video';
  price: number;
  // Subscription support
  isSubscription?: boolean;
  interval?: 'month' | 'year';
  gumroadLink?: string;
  deadline?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GumroadCredentialsDoc {
  email: string;
  password: string;
  updatedAt: Date;
}

export const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📝 Attempting to add project to Firestore (attempt ${attempt}/${maxRetries}):`, {
        title: project.title,
        projectType: project.projectType,
        userId: project.userId,
        hasDescription: !!project.description,
        hasDriveLink: !!project.googleDriveLink,
      });

      if (!db) {
        throw new Error('Firestore database not initialized');
      }

      const projectData = {
        ...project,
        price: project.price,
        // Ensure optional subscription fields persist
        isSubscription: project.isSubscription ?? false,
        interval: project.interval ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('📊 Project data to save:', projectData);

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      console.log('✅ Project added successfully with ID:', docRef.id);
      return { id: docRef.id, error: null };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Failed to add project to Firestore (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  console.error('❌ All attempts failed. Final error details:', {
    code: lastError.code,
    message: lastError.message,
    stack: lastError.stack,
  });
  return { id: null, error: lastError.message };
};

export const getProjectsByUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        price: data.price,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    }) as Project[];
    return { projects, error: null };
  } catch (error: any) {
    return { projects: [], error: error.message };
  }
};

export const getProjectById = async (projectId: string) => {
  try {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const project = {
        id: docSnap.id,
        ...data,
        price: data.price,
        isSubscription: data.isSubscription ?? false,
        interval: data.interval ?? undefined,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as Project;
      return { project, error: null };
    } else {
      return { project: null, error: 'Project not found' };
    }
  } catch (error: any) {
    return { project: null, error: error.message };
  }
};

export const updateProjectStatus = async (projectId: string, status: 'approved' | 'rejected', rejectionReason?: string, gumroadLink?: string) => {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📝 Updating project status (attempt ${attempt}/${maxRetries}):`, { projectId, status, rejectionReason, gumroadLink });
      
      const docRef = doc(db, 'projects', projectId);
      
      // Build update object, only include rejectionReason if it has a value
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };
      
      // Only add rejectionReason if it's provided (for rejected projects)
      if (rejectionReason !== undefined) {
        updateData.rejectionReason = rejectionReason;
      }
      
      // Only add gumroadLink if it's provided (for approved projects)
      if (gumroadLink !== undefined) {
        updateData.gumroadLink = gumroadLink;
      }
      
      console.log('📊 Update data:', updateData);
      
      await updateDoc(docRef, updateData);
      
      console.log('✅ Project status updated successfully');
      return { error: null };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Failed to update project status (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  console.error('❌ All attempts failed. Final error details:', {
    code: lastError.code,
    message: lastError.message,
    stack: lastError.stack,
  });
  return { error: lastError.message };
}; 

// Gumroad Credentials (stored per user; used at publish time)
export const saveGumroadCredentials = async (userId: string, email: string, password: string) => {
  try {
    const ref = doc(db, 'gumroad_credentials', userId);
    const data: GumroadCredentialsDoc = { email, password, updatedAt: new Date() };
    await setDoc(ref, data, { merge: true });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getGumroadCredentials = async (userId: string) => {
  try {
    const ref = doc(db, 'gumroad_credentials', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { credentials: null, error: null };
    const data = snap.data() as any;
    return { credentials: { email: data.email, password: data.password } as { email: string; password: string }, error: null };
  } catch (error: any) {
    return { credentials: null, error: error.message };
  }
};