import { Redis } from '@upstash/redis';
import { logger } from '@/utils/logger.utils';
import { createHash } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface CacheEntry {
  summary: string;
  fileName: string;
  fileSize: number;
  contentHash: string;
}

export class CacheService {
  private static async generateKey(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentHash = createHash('sha256').update(buffer).digest('hex');
    
    const key = `summary:${contentHash}`;
    logger.debug('Generated cache key', { 
      key,
      attributes: {
        name: file.name,
        size: file.size,
        contentHash
      }
    });
    return key;
  }

  static async get(file: File): Promise<CacheEntry | null> {
    try {
      const key = await this.generateKey(file);
      logger.debug('Attempting to get from cache', { key });
      
      const cached = await redis.get<CacheEntry>(key);
      
      if (cached) {
        logger.info('Cache hit', { 
          fileName: file.name,
          key,
          cachedData: {
            fileName: cached.fileName,
            fileSize: cached.fileSize,
            contentHash: cached.contentHash
          }
        });
        return cached;
      }
      
      logger.info('Cache miss', { 
        fileName: file.name,
        key
      });
      return null;
    } catch (error) {
      logger.error('Cache get error', { 
        error,
        fileName: file.name,
        redisUrl: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'missing'
      });
      return null;
    }
  }

  static async set(file: File, summary: string): Promise<void> {
    try {
      const key = await this.generateKey(file);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentHash = createHash('sha256').update(buffer).digest('hex');
      
      const entry: CacheEntry = {
        summary,
        fileName: file.name,
        fileSize: file.size,
        contentHash
      };

      logger.debug('Attempting to set cache', { 
        key,
        entry: {
          fileName: entry.fileName,
          fileSize: entry.fileSize,
          contentHash: entry.contentHash,
          summaryLength: entry.summary.length
        }
      });

      await redis.set(key, entry);
      logger.info('Cache set successfully', { 
        fileName: file.name,
        key
      });
    } catch (error) {
      logger.error('Cache set error', { 
        error,
        fileName: file.name,
        redisUrl: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'missing'
      });
    }
  }
} 