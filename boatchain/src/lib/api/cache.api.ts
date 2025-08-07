import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    
    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - item.timestamp > CACHE_EXPIRY_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch {
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch {
    // Ignore cache errors
  }
}

export async function clearCache(pattern: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    await AsyncStorage.multiRemove(matchingKeys);
  } catch {
    // Ignore errors
  }
}