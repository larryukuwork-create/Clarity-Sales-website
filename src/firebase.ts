import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import firebaseConfigFromJson from "../firebase-applet-config.json";

// Standard Firestore Operation Types from SKILL.md
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

// 1. Resolve Firebase Client Configuration with environment fallbacks
const resolvedConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseConfigFromJson?.apiKey || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFromJson?.authDomain || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFromJson?.projectId || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFromJson?.storageBucket || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFromJson?.messagingSenderId || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseConfigFromJson?.appId || "",
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || (firebaseConfigFromJson as any)?.firestoreDatabaseId || "(default)"
};

// Validate variables and check for broken placeholder defaults
let isConfigured = true;
let configError = "";

if (!resolvedConfig.apiKey || resolvedConfig.apiKey.includes("YOUR") || resolvedConfig.apiKey.includes("MY_")) {
  isConfigured = false;
  configError = "Firebase ApiKey is missing or a placeholder";
} else if (!resolvedConfig.projectId || resolvedConfig.projectId.includes("YOUR") || resolvedConfig.projectId.includes("MY_")) {
  isConfigured = false;
  configError = "Firebase ProjectID is missing or a placeholder";
}

export const isFirebaseConfigured = isConfigured;
export const firebaseConfigError = configError;

// 2. Safely initialize Firebase app to prevent duplicate app instances
let app;
if (getApps().length === 0) {
  app = initializeApp(resolvedConfig);
} else {
  app = getApp();
}

// 3. Initialize Cloud Firestore and handle database ID selection correctly
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);

// 4. Initialize Firebase Auth and Provider setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');

// 5. Hardened Firestore standard error logger & handler conforming to SKILL.md
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
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

// 6. Define robust Firestore timeout wrapper to prevent hanging indefinitely
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("FIRESTORE_TIMEOUT"));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// 7. Define local storage fallback for database writes when offline or database hangs
const LOCAL_INTAKES_KEY = 'clarityspace_local_intakes';

export interface LocalSubmission {
  id: string;
  collection: 'intakes' | 'outreachLeads' | 'trackingEvents' | 'system_health';
  data: any;
  savedAt: string;
  offlineMode: boolean;
}

export function saveToLocalFallback(
  collectionName: 'intakes' | 'outreachLeads' | 'trackingEvents' | 'system_health', 
  data: any, 
  existingId?: string
): string {
  try {
    const listJson = localStorage.getItem(LOCAL_INTAKES_KEY) || '[]';
    const list: LocalSubmission[] = JSON.parse(listJson);
    
    const id = existingId || 'local_' + Math.random().toString(36).substring(2, 11);
    
    // Clean up serverTimestamp values for local representation
    const sanitizedData = { ...data };
    if (sanitizedData.created_at) sanitizedData.created_at = new Date().toISOString();
    if (sanitizedData.updated_at) sanitizedData.updated_at = new Date().toISOString();
    if (sanitizedData.intake_submitted_at) sanitizedData.intake_submitted_at = new Date().toISOString();

    const newRecord: LocalSubmission = {
      id,
      collection: collectionName,
      data: sanitizedData,
      savedAt: new Date().toISOString(),
      offlineMode: true
    };
    
    const index = list.findIndex(item => item.id === id);
    if (index >= 0) {
      list[index] = newRecord;
    } else {
      list.push(newRecord);
    }
    
    localStorage.setItem(LOCAL_INTAKES_KEY, JSON.stringify(list));
    console.warn("Client data successfully persisted to LocalStorageFallback:", id, sanitizedData);
    return id;
  } catch (err) {
    console.error("Critical: LocalStorage fallback write failed:", err);
    return 'local_storage_failed';
  }
}

export function updateLocalFallback(id: string, updates: any): void {
  try {
    const listJson = localStorage.getItem(LOCAL_INTAKES_KEY) || '[]';
    const list: LocalSubmission[] = JSON.parse(listJson);
    const index = list.findIndex(item => item.id === id);
    if (index >= 0) {
      list[index].data = { ...list[index].data, ...updates };
      list[index].data.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_INTAKES_KEY, JSON.stringify(list));
      console.warn("Client data successfully updated in LocalStorageFallback:", id);
    }
  } catch (err) {
    console.error("Critical: LocalStorage fallback update failed:", err);
  }
}

export function getLocalFallbackSubmissions(): LocalSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_INTAKES_KEY) || '[]');
  } catch {
    return [];
  }
}

