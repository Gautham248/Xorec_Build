import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/firebase-config';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second
const cache = new Map<string, { data: any; timestamp: number }>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithCache = async <T = any>(
  collectionName: string,
  queryConstraints: any[] = [],
  cacheKey?: string,
  retryCount = 0
) => {
  const key = cacheKey || collectionName;
  const cached = cache.get(key);
  
  // Return cached data if valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Only cache successful responses
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    // Return cached data if available, even if expired
    if (cached) {
      console.warn('Using expired cache due to fetch error');
      return cached.data;
    }

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return fetchWithCache(collectionName, queryConstraints, cacheKey, retryCount + 1);
    }

    throw error;
  }
};