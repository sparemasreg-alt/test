import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize mock Firebase/Firestore APIs globally to resolve unimported variables in legacy components
let mockUser: any = null;

const listeners = new Set<(user: any) => void>();

(globalThis as any).auth = {
  get currentUser() {
    return mockUser;
  },
  onAuthStateChanged: (cb: any) => {
    listeners.add(cb);
    cb(mockUser);
    return () => {
      listeners.delete(cb);
    };
  },
  signOut: async () => {
    mockUser = null;
    listeners.forEach(cb => cb(null));
  },
  signIn: async (identifier: string) => {
    identifier = identifier.toLowerCase().trim();
    const dbData = getLocalDb();
    const users = Object.keys(dbData)
      .filter(k => k.startsWith('users/') && k.split('/').length === 2)
      .map(k => ({ id: k.split('/')[1], data: dbData[k] }));
      
    const userDoc = users.find(u => 
      u.data.email?.toLowerCase() === identifier || 
      u.data.username?.toLowerCase() === identifier
    );

    if (!userDoc) {
      throw new Error('Account does not exist. Please sign up first.');
    }

    mockUser = {
      uid: userDoc.id,
      email: userDoc.data.email,
      username: userDoc.data.username,
      emailVerified: true
    };
    listeners.forEach(cb => cb(mockUser));
  },
  signUp: async (email: string, username: string, club: string) => {
    const uid = email.split('@')[0] + '_id';
    const userDoc = await (globalThis as any).getDoc({ path: `users/${uid}`, args: [] });
    
    if (userDoc.exists()) {
      throw new Error('Account already exists. Please sign in.');
    }

    const isAdmin = email.toLowerCase() === 'sparemasr.eg@gmail.com' || email.toLowerCase().includes('mathewashraf10');
    await (globalThis as any).setDoc({ path: `users/${uid}`, args: [] }, {
      email: email,
      username: username || email.split('@')[0],
      club: club || '',
      coins: 25000,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    });

    mockUser = {
      uid,
      email: email,
      username: username || email.split('@')[0],
      emailVerified: true
    };
    listeners.forEach(cb => cb(mockUser));
  }
};

const getLocalDb = () => {
  const dbStr = localStorage.getItem('mockFirestore') || '{}';
  return JSON.parse(dbStr);
};

const saveLocalDb = (data: any) => {
  localStorage.setItem('mockFirestore', JSON.stringify(data));
};

(globalThis as any).db = {};

(globalThis as any).collection = (dbOrCol: any, path?: string, ...args: any[]) => {
  let fullPath = '';
  if (dbOrCol && typeof dbOrCol === 'object' && dbOrCol.path) {
    fullPath = [dbOrCol.path, path, ...args].filter(Boolean).join('/');
  } else if (typeof dbOrCol === 'object' && typeof path === 'string') {
    fullPath = [path, ...args].filter(Boolean).join('/');
  } else {
    fullPath = path || '';
  }
  return { path: fullPath, args: [] };
};

(globalThis as any).doc = (dbOrCol: any, path?: string, ...args: any[]) => {
  let fullPath = '';
  if (dbOrCol && typeof dbOrCol === 'object' && dbOrCol.path) {
    const parentPath = dbOrCol.path;
    const docId = path || Math.random().toString(36).substring(2, 11);
    fullPath = [parentPath, docId].filter(Boolean).join('/');
  } else if (typeof dbOrCol === 'object' && typeof path === 'string') {
    fullPath = [path, ...args].filter(Boolean).join('/');
  } else {
    fullPath = path || Math.random().toString(36).substring(2, 11);
  }
  const id = fullPath.split('/').pop() || '';
  return { path: fullPath, args: [], id };
};

(globalThis as any).query = (col: any, ...args: any[]) => {
  return { col, args };
};

(globalThis as any).where = (field: string, op: string, val: any) => {
  return { field, op, val };
};

(globalThis as any).getDocs = async (queryOrCol: any) => {
  const path = queryOrCol.path || (queryOrCol.col && queryOrCol.col.path);
  if (!path) return { docs: [] };
  const dbData = getLocalDb();
  
  // Find all keys starting with path/
  const keys = Object.keys(dbData).filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1);
  let docs = keys.map(k => ({
    id: k.split('/').pop(),
    data: () => dbData[k]
  }));

  // Apply filters if any
  const filters = queryOrCol.args || [];
  if (filters.length > 0) {
    docs = docs.filter(d => {
      const docData = d.data();
      if (!docData) return false;
      for (const filter of filters) {
        if (filter.field && filter.op) {
          const fieldVal = docData[filter.field];
          if (filter.op === '==') {
            if (fieldVal !== filter.val) return false;
          } else if (filter.op === '>') {
            if (!(fieldVal > filter.val)) return false;
          } else if (filter.op === '>=') {
            if (!(fieldVal >= filter.val)) return false;
          } else if (filter.op === '<') {
            if (!(fieldVal < filter.val)) return false;
          } else if (filter.op === '<=') {
            if (!(fieldVal <= filter.val)) return false;
          }
        }
      }
      return true;
    });
  }

  return { 
    docs, 
    empty: docs.length === 0,
    map: (cb: any) => docs.map(cb),
    forEach: (cb: any) => docs.forEach(cb)
  };
};

(globalThis as any).getDoc = async (docRef: any) => {
  const dbData = getLocalDb();
  const data = dbData[docRef.path];
  return {
    id: docRef.path.split('/').pop(),
    exists: () => !!data,
    data: () => data || null
  };
};

(globalThis as any).setDoc = async (docRef: any, data: any) => {
  const dbData = getLocalDb();
  dbData[docRef.path] = data;
  saveLocalDb(dbData);
  return {};
};

(globalThis as any).updateDoc = async (docRef: any, data: any) => {
  const dbData = getLocalDb();
  if (dbData[docRef.path]) {
    const existingData = dbData[docRef.path];
    const updatedData = { ...existingData };
    
    for (const key in data) {
      if (data[key] && typeof data[key] === 'object' && data[key].__op === 'increment') {
        const currentVal = Number(existingData[key]) || 0;
        updatedData[key] = currentVal + data[key].val;
      } else {
        updatedData[key] = data[key];
      }
    }
    
    dbData[docRef.path] = updatedData;
    saveLocalDb(dbData);
  }
  return {};
};

(globalThis as any).deleteDoc = async (docRef: any) => {
  const dbData = getLocalDb();
  delete dbData[docRef.path];
  saveLocalDb(dbData);
  return {};
};

(globalThis as any).onSnapshot = (queryOrRef: any, onNext: any, onError?: any) => {
  // Mock snapshot via interval for simplicity
  let lastDataHash = '';
  
  const check = async () => {
    try {
      let result: any;
      let dataForHash: any;

      if (queryOrRef.path && queryOrRef.path.split('/').length % 2 === 0) {
        // document
        result = await (globalThis as any).getDoc(queryOrRef);
        dataForHash = result.data();
      } else {
        // collection / query
        result = await (globalThis as any).getDocs(queryOrRef);
        dataForHash = result.docs.map((d: any) => ({ id: d.id, data: d.data() }));
      }
      
      const currentHash = JSON.stringify(dataForHash);
      if (currentHash !== lastDataHash) {
        lastDataHash = currentHash;
        onNext(result);
      }
    } catch (err) {
      if (onError) onError(err);
      else console.error("Snapshot error:", err);
    }
  };

  const interval = setInterval(check, 1000);
  check(); // Initial check

  return () => clearInterval(interval);
};

(globalThis as any).increment = (n: number) => ({ __op: 'increment', val: n });

// Initialize DB with some data if empty
async function initDb() {
  const dbData = getLocalDb();
  
  // 1. Check if packs exist
  const packKeys = Object.keys(dbData).filter(k => k.startsWith('packs/'));
  if (packKeys.length === 0) {
    const packs = [
      { id: 'bronze', name: 'Bronze Pack', price: 500, rarity: 'Common' },
      { id: 'silver', name: 'Silver Pack', price: 1500, rarity: 'Rare' },
      { id: 'gold', name: 'Gold Pack', price: 5000, rarity: 'Epic' }
    ];
    packs.forEach(p => {
      dbData[`packs/${p.id}`] = p;
    });
  }

  // 2. Check if players exist
  const playerKeys = Object.keys(dbData).filter(k => k.startsWith('players/'));
  if (playerKeys.length === 0) {
    // Generate some initial players
    const { generateMockPlayers } = await import('./data/mockPlayers');
    const mockPlayers = generateMockPlayers(50);
    mockPlayers.forEach(p => {
      dbData[`players/${p.id}`] = p;
    });
  }
  
  // 3. Check if managers exist
  const managerKeys = Object.keys(dbData).filter(k => k.startsWith('managers/'));
  if (managerKeys.length === 0) {
    const { managersData } = await import('./data/managers');
    managersData.forEach(p => {
      dbData[`managers/${p.id}`] = p;
    });
  }

  saveLocalDb(dbData);
}

initDb();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
