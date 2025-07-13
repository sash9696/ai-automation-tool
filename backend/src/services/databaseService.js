import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      // Create database in the backend directory
      const dbPath = path.join(__dirname, '..', '..', 'data', 'scheduler.db');
      
      // Ensure data directory exists
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new Database(dbPath);
      this.createTables();
      console.log('📊 Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  createTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Refresh tokens table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Scheduled jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_jobs (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        post_data TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        published_at TEXT,
        linkedin_post_id TEXT,
        linkedin_post_urn TEXT,
        error_message TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Batches table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        schedule_time TEXT NOT NULL,
        total_posts INTEGER DEFAULT 0,
        completed_posts INTEGER DEFAULT 0,
        failed_posts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Analytics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        total_posts INTEGER DEFAULT 0,
        successful_posts INTEGER DEFAULT 0,
        failed_posts INTEGER DEFAULT 0,
        total_engagement INTEGER DEFAULT 0,
        user_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // LinkedIn sessions table - now per user
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS linkedin_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TEXT NOT NULL,
        user_profile TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    console.log('📋 Database tables created successfully');
  }

  // Job management methods
  createScheduledJob(jobData) {
    const stmt = this.db.prepare(`
      INSERT INTO scheduled_jobs (
        id, batch_id, post_id, post_data, scheduled_time, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      jobData.id,
      jobData.batchId,
      jobData.postId,
      JSON.stringify(jobData.postData),
      jobData.scheduledTime.toISOString(),
      'pending'
    );

    return result;
  }

  getDueJobs() {
    const stmt = this.db.prepare(`
      SELECT * FROM scheduled_jobs 
      WHERE status = 'pending' 
      AND datetime(scheduled_time) <= datetime('now')
      ORDER BY scheduled_time ASC
    `);

    const jobs = stmt.all();
    return jobs.map(job => ({
      ...job,
      postData: JSON.parse(job.post_data),
      scheduledTime: new Date(job.scheduled_time)
    }));
  }

  updateJobStatus(jobId, status, linkedinPostId = null, linkedinPostUrn = null, errorMessage = null) {
    const stmt = this.db.prepare(`
      UPDATE scheduled_jobs 
      SET status = ?, 
          published_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE published_at END,
          linkedin_post_id = ?,
          linkedin_post_urn = ?,
          error_message = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    return stmt.run(status, status, linkedinPostId, linkedinPostUrn, errorMessage, jobId);
  }

  getJobById(jobId) {
    const stmt = this.db.prepare('SELECT * FROM scheduled_jobs WHERE id = ?');
    const job = stmt.get(jobId);
    
    if (job) {
      return {
        ...job,
        postData: JSON.parse(job.post_data),
        scheduledTime: new Date(job.scheduled_time)
      };
    }
    
    return null;
  }

  // Batch management methods
  createBatch(batchData) {
    const stmt = this.db.prepare(`
      INSERT INTO batches (
        id, name, schedule_time, total_posts
      ) VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
      batchData.id,
      batchData.name,
      batchData.scheduleTime,
      batchData.totalPosts
    );
  }

  updateBatchProgress(batchId, completed = 0, failed = 0) {
    const stmt = this.db.prepare(`
      UPDATE batches 
      SET completed_posts = completed_posts + ?,
          failed_posts = failed_posts + ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    return stmt.run(completed, failed, batchId);
  }

  getBatchById(batchId) {
    const stmt = this.db.prepare('SELECT * FROM batches WHERE id = ?');
    return stmt.get(batchId);
  }

  getAllBatches() {
    const stmt = this.db.prepare('SELECT * FROM batches ORDER BY created_at DESC');
    return stmt.all();
  }

  // Analytics methods
  recordAnalytics(analyticsData) {
    const stmt = this.db.prepare(`
      INSERT INTO analytics (
        date, total_posts, successful_posts, failed_posts, total_engagement
      ) VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      analyticsData.date,
      analyticsData.totalPosts,
      analyticsData.successfulPosts,
      analyticsData.failedPosts,
      analyticsData.totalEngagement
    );
  }

  getAnalytics(dateRange = 7) {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE date >= date('now', '-${dateRange} days')
      ORDER BY date DESC
    `);

    return stmt.all();
  }

  // Utility methods
  getStats() {
    const totalJobs = this.db.prepare('SELECT COUNT(*) as count FROM scheduled_jobs').get();
    const pendingJobs = this.db.prepare("SELECT COUNT(*) as count FROM scheduled_jobs WHERE status = 'pending'").get();
    const completedJobs = this.db.prepare("SELECT COUNT(*) as count FROM scheduled_jobs WHERE status = 'completed'").get();
    const failedJobs = this.db.prepare("SELECT COUNT(*) as count FROM scheduled_jobs WHERE status = 'failed'").get();

    return {
      total: totalJobs.count,
      pending: pendingJobs.count,
      completed: completedJobs.count,
      failed: failedJobs.count
    };
  }

  // User management methods
  createUser(userData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
      userData.id,
      userData.email,
      userData.name,
      userData.password_hash || null
    );
  }

  getUserById(userId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(userId);
  }

  getUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  updateUser(userId, userData) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    return stmt.run(userData.name, userData.email, userId);
  }

  // User session management methods
  createUserSession(sessionData) {
    const stmt = this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at)
      VALUES (?, ?, ?)
    `);

    return stmt.run(
      sessionData.id,
      sessionData.userId,
      sessionData.expiresAt.toISOString()
    );
  }

  getUserSession(sessionId) {
    const stmt = this.db.prepare(`
      SELECT us.*, u.id as user_id, u.email, u.name 
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.id = ? AND datetime(us.expires_at) > datetime('now')
    `);
    
    return stmt.get(sessionId);
  }

  deleteUserSession(sessionId) {
    const stmt = this.db.prepare('DELETE FROM user_sessions WHERE id = ?');
    return stmt.run(sessionId);
  }

  deleteExpiredSessions() {
    const stmt = this.db.prepare(`
      DELETE FROM user_sessions 
      WHERE datetime(expires_at) <= datetime('now')
    `);
    
    return stmt.run();
  }

  // Refresh token management methods
  createRefreshToken(tokenData) {
    const stmt = this.db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
      tokenData.id,
      tokenData.userId,
      tokenData.token,
      tokenData.expiresAt.toISOString()
    );
  }

  getRefreshToken(token) {
    const stmt = this.db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE token = ? AND datetime(expires_at) > datetime('now')
    `);
    
    return stmt.get(token);
  }

  updateRefreshToken(tokenId, tokenData) {
    const stmt = this.db.prepare(`
      UPDATE refresh_tokens 
      SET token = ?, expires_at = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    return stmt.run(
      tokenData.token,
      tokenData.expiresAt.toISOString(),
      tokenId
    );
  }

  deleteRefreshToken(token) {
    const stmt = this.db.prepare('DELETE FROM refresh_tokens WHERE token = ?');
    return stmt.run(token);
  }

  deleteAllRefreshTokens(userId) {
    const stmt = this.db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?');
    return stmt.run(userId);
  }

  deleteExpiredRefreshTokens() {
    const stmt = this.db.prepare(`
      DELETE FROM refresh_tokens 
      WHERE datetime(expires_at) <= datetime('now')
    `);
    
    return stmt.run();
  }

  // Update user password
  updateUserPassword(userId, passwordHash) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    return stmt.run(passwordHash, userId);
  }

  // LinkedIn session management methods - now per user
  saveLinkedInSession(sessionData, userId) {
    // Clear any existing sessions for this user first
    this.db.prepare('DELETE FROM linkedin_sessions WHERE user_id = ?').run(userId);
    
    const stmt = this.db.prepare(`
      INSERT INTO linkedin_sessions (
        user_id, access_token, refresh_token, expires_at, user_profile
      ) VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      userId,
      sessionData.accessToken,
      sessionData.refreshToken || null,
      sessionData.expiresAt.toISOString(),
      sessionData.userProfile ? JSON.stringify(sessionData.userProfile) : null
    );
  }

  getLinkedInSession(userId) {
    const stmt = this.db.prepare('SELECT * FROM linkedin_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
    const session = stmt.get(userId);
    
    if (session) {
      return {
        ...session,
        userProfile: session.user_profile ? JSON.parse(session.user_profile) : null,
        expiresAt: new Date(session.expires_at)
      };
    }
    
    return null;
  }

  updateLinkedInSession(sessionData, userId) {
    const stmt = this.db.prepare(`
      UPDATE linkedin_sessions 
      SET access_token = ?,
          refresh_token = ?,
          expires_at = ?,
          user_profile = ?,
          updated_at = datetime('now')
      WHERE user_id = ?
    `);

    return stmt.run(
      sessionData.accessToken,
      sessionData.refreshToken || null,
      sessionData.expiresAt.toISOString(),
      sessionData.userProfile ? JSON.stringify(sessionData.userProfile) : null,
      userId
    );
  }

  clearLinkedInSession(userId) {
    const stmt = this.db.prepare('DELETE FROM linkedin_sessions WHERE user_id = ?');
    return stmt.run(userId);
  }

  isLinkedInSessionValid(userId) {
    const session = this.getLinkedInSession(userId);
    if (!session) return false;
    
    // Check if token is expired
    return new Date(session.expiresAt) > new Date();
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService; 