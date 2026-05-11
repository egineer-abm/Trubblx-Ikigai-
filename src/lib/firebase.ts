import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, query, collection, where, orderBy, onSnapshot, getDocFromServer, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
// Fallback config for deployment environments where the JSON file might be ignored or missing
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID
};

// Import config, but wrap in try-catch to handle missing file during deployment
let firebaseConfig: any;
try {
  // @ts-ignore - file may not exist in some environments
  const localConfig = await import('../../firebase-applet-config.json');
  firebaseConfig = localConfig.default || localConfig;
} catch (e) {
  firebaseConfig = envConfig;
}

// Ensure critical values are present
const finalConfig = {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey || envConfig.apiKey,
  authDomain: firebaseConfig.authDomain || envConfig.authDomain,
  projectId: firebaseConfig.projectId || envConfig.projectId,
  storageBucket: firebaseConfig.storageBucket || envConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId || envConfig.messagingSenderId,
  appId: firebaseConfig.appId || envConfig.appId,
  measurementId: firebaseConfig.measurementId || envConfig.measurementId
};

const app = initializeApp(finalConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || envConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

// Connection test as required by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network.");
    }
  }
}
testConnection();

// Error handler as required by instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
