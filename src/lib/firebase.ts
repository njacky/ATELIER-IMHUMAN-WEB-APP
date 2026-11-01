import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ClientGroup, AuthUser } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
// Use named database if specified in config, otherwise default
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Unique client device ID generated per tab/session to identify source device
export const CURRENT_DEVICE_ID = (() => {
  try {
    let id = sessionStorage.getItem('atelier_inhm_device_id');
    if (!id) {
      id = `device_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      sessionStorage.setItem('atelier_inhm_device_id', id);
    }
    return id;
  } catch {
    return `device_${Math.random().toString(36).substring(2, 9)}`;
  }
})();

// Helper to get safe document key from user email
export function getWorkspaceDocId(email: string): string {
  const sanitized = (email || 'anonymous').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  return `workspace_${sanitized}`;
}

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    return {
      email: fbUser.email || 'ozalehadi@gmail.com',
      name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Oza Lehadi'),
      avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Principal Architect / Studio Lead',
      isAuthenticated: true,
    };
  } catch (error: any) {
    console.warn('Firebase signInWithPopup notice:', error?.message || error);
    // If popup blocked or cancelled in iframe environment, throw so caller can fallback to instant authorized sign in
    throw error;
  }
}

// Sign out from Firebase
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut notice:', err);
  }
}

// Save projects to Firestore Cloud for the specific Google Account
export async function saveUserProjectsToCloud(
  userEmail: string,
  clients: ClientGroup[],
  sourceDeviceId: string = CURRENT_DEVICE_ID
): Promise<void> {
  if (!userEmail) return;
  try {
    const docId = getWorkspaceDocId(userEmail);
    const docRef = doc(db, 'user_workspaces', docId);

    // Filter or clean files to keep firestore doc within size limits (only metadata, dataUrls stripped if huge)
    const cleanedClients = clients.map((client) => ({
      ...client,
      deliverables: (client.deliverables || []).map((del) => ({
        ...del,
        files: (del.files || []).map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          category: f.category,
          type: f.type,
          uploadDate: f.uploadDate,
          // We do not store huge binary dataUrl strings inside Firestore doc
        })),
      })),
    }));

    await setDoc(
      docRef,
      {
        email: userEmail.toLowerCase().trim(),
        clientsData: JSON.stringify(cleanedClients),
        updatedAt: new Date().toISOString(),
        lastUpdatedDeviceId: sourceDeviceId,
        cloudSynced: true,
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync projects to cloud:', err);
    throw err;
  }
}

// Load projects from Firestore Cloud for the specific Google Account
export async function loadUserProjectsFromCloud(userEmail: string): Promise<ClientGroup[] | null> {
  if (!userEmail) return null;
  try {
    const docId = getWorkspaceDocId(userEmail);
    const docRef = doc(db, 'user_workspaces', docId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data?.clientsData) {
        const parsed = JSON.parse(data.clientsData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    return null;
  } catch (err) {
    console.warn('Failed to load projects from cloud:', err);
    return null;
  }
}

// Real-time listener: automatically sync projects across different devices logged into the same Google Account
export function subscribeToUserProjectsCloud(
  userEmail: string,
  onRemoteChange: (clients: ClientGroup[], remoteDeviceId: string, updatedAt: string) => void
): () => void {
  if (!userEmail) return () => {};

  const docId = getWorkspaceDocId(userEmail);
  const docRef = doc(db, 'user_workspaces', docId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const remoteDeviceId = data?.lastUpdatedDeviceId || '';

        // If the update originated from another device (or initial load), notify listener
        if (remoteDeviceId !== CURRENT_DEVICE_ID && data?.clientsData) {
          try {
            const parsed = JSON.parse(data.clientsData);
            if (Array.isArray(parsed)) {
              onRemoteChange(parsed, remoteDeviceId, data.updatedAt || new Date().toISOString());
            }
          } catch (err) {
            console.error('Error parsing remote synchronized projects:', err);
          }
        }
      }
    },
    (err) => {
      console.warn('Firestore subscription notice:', err);
    }
  );

  return unsubscribe;
}
