import Redis from "ioredis";

/**
 * 🔴 REDIS CONFIGURATION
 *
 * Redis là in-memory database dùng để cache dữ liệu.
 * Thay vì query PostgreSQL mỗi lần (chậm 100-500ms),
 * ta lưu kết quả vào Redis (nhanh 1-5ms).
 *
 * Ví dụ:
 * - Request 1: Query DB → Lưu vào Redis → Trả về (200ms)
 * - Request 2-1000: Lấy từ Redis → Trả về (2ms) ⚡
 */

// Tạo Redis client
// Ưu tiên REDIS_URL (Render Key Value / Upstash) nếu có, fallback về host/port riêng lẻ
const redisOptions: any = process.env.REDIS_URL
  ? {
      // Kết nối qua URL (production: Render/Upstash)
      // Upstash dùng TLS (rediss://), Render dùng redis://
      lazyConnect: false,
      tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
    }
  : {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0"),
    };

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      // Retry strategy: Tự động kết nối lại nếu mất kết nối
      retryStrategy: (times: number) => {
        if (times > 10) return null; // Dừng retry sau 10 lần, tránh spam log
        return Math.min(times * 100, 3000);
      },
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
    })
  : new Redis({
      ...redisOptions,
      // Retry strategy: Tự động kết nối lại nếu mất kết nối
      retryStrategy: (times: number) => {
        if (times > 10) return null;
        return Math.min(times * 100, 3000);
      },
      connectTimeout: 10000,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });
// Event listeners để theo dõi trạng thái Redis
redis.on("connect", () => {
  console.log("✅ Redis: Connected to Redis server");
});

redis.on("ready", () => {
  console.log("✅ Redis: Ready to accept commands");
});

redis.on("error", (err: Error) => {
  console.error("❌ Redis Error:", err.message);
});

redis.on("close", () => {
  console.log("⚠️  Redis: Connection closed");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis: Reconnecting...");
});

/**
 * 🎯 CACHE HELPER FUNCTIONS
 * Các hàm tiện ích để làm việc với cache
 */

export class CacheService {
  /**
   * Lấy dữ liệu từ cache
   * @param key - Cache key (ví dụ: 'courses:all', 'user:123')
   * @returns Dữ liệu đã parse hoặc null nếu không tìm thấy
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache GET error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Lưu dữ liệu vào cache với thời gian expire
   * @param key - Cache key
   * @param value - Dữ liệu cần cache
   * @param ttl - Time to live (giây). Mặc định: 5 phút (300s)
   */
  static async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache SET error for key "${key}":`, error);
    }
  }

  /**
   * Xóa cache theo key
   * @param key - Cache key hoặc pattern (ví dụ: 'courses:*')
   */
  static async delete(key: string): Promise<void> {
    try {
      // Nếu key có wildcard (*), xóa tất cả keys matching
      if (key.includes("*")) {
        const keys = await redis.keys(key);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        await redis.del(key);
      }
    } catch (error) {
      console.error(`Cache DELETE error for key "${key}":`, error);
    }
  }

  /**
   * Xóa toàn bộ cache
   * ⚠️ Cẩn thận khi dùng function này!
   */
  static async flush(): Promise<void> {
    try {
      await redis.flushdb();
      console.log("🗑️  All cache cleared");
    } catch (error) {
      console.error("Cache FLUSH error:", error);
    }
  }

  /**
   * Kiểm tra key có tồn tại không
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Lấy thời gian còn lại của key (TTL)
   * @returns Số giây còn lại, hoặc -1 nếu không có expire, -2 nếu key không tồn tại
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key "${key}":`, error);
      return -2;
    }
  }

  /**
   * Increment counter (dùng cho rate limiting, leaderboard)
   * @param key - Counter key
   * @param increment - Số lượng tăng (mặc định: 1)
   * @returns Giá trị mới sau khi increment
   */
  static async increment(key: string, increment: number = 1): Promise<number> {
    try {
      return await redis.incrby(key, increment);
    } catch (error) {
      console.error(`Cache INCREMENT error for key "${key}":`, error);
      return 0;
    }
  }

  /**
   * Lưu vào Sorted Set (dùng cho leaderboard)
   * @param key - Sorted set key
   * @param score - Điểm số
   * @param member - Thành viên (userId)
   */
  static async addToSortedSet(
    key: string,
    score: number,
    member: string,
  ): Promise<void> {
    try {
      await redis.zadd(key, score, member);
    } catch (error) {
      console.error(`Cache ZADD error for key "${key}":`, error);
    }
  }

  /**
   * Lấy top N từ Sorted Set (leaderboard)
   * @param key - Sorted set key
   * @param count - Số lượng top (mặc định: 10)
   * @returns Array of [member, score]
   */
  static async getTopFromSortedSet(
    key: string,
    count: number = 10,
  ): Promise<Array<{ member: string; score: number }>> {
    try {
      const results = await redis.zrevrange(key, 0, count - 1, "WITHSCORES");
      const formatted = [];
      for (let i = 0; i < results.length; i += 2) {
        formatted.push({
          member: results[i],
          score: parseFloat(results[i + 1]),
        });
      }
      return formatted;
    } catch (error) {
      console.error(`Cache ZREVRANGE error for key "${key}":`, error);
      return [];
    }
  }
}

export default redis;
