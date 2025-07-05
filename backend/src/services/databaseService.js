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
    // Scheduled jobs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_jobs (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        post_data TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        published_at TEXT,
        linkedin_post_id TEXT,
        linkedin_post_urn TEXT,
        error_message TEXT
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // LinkedIn sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS linkedin_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TEXT NOT NULL,
        user_profile TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  // LinkedIn session management methods
  saveLinkedInSession(sessionData) {
    // Clear any existing sessions first (we only support one session)
    this.db.prepare('DELETE FROM linkedin_sessions').run();
    
    const stmt = this.db.prepare(`
      INSERT INTO linkedin_sessions (
        access_token, refresh_token, expires_at, user_profile
      ) VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
      sessionData.accessToken,
      sessionData.refreshToken || null,
      sessionData.expiresAt.toISOString(),
      sessionData.userProfile ? JSON.stringify(sessionData.userProfile) : null
    );
  }

  getLinkedInSession() {
    const stmt = this.db.prepare('SELECT * FROM linkedin_sessions ORDER BY created_at DESC LIMIT 1');
    const session = stmt.get();
    
    if (session) {
      return {
        ...session,
        userProfile: session.user_profile ? JSON.parse(session.user_profile) : null,
        expiresAt: new Date(session.expires_at)
      };
    }
    
    return null;
  }

  updateLinkedInSession(sessionData) {
    const stmt = this.db.prepare(`
      UPDATE linkedin_sessions 
      SET access_token = ?,
          refresh_token = ?,
          expires_at = ?,
          user_profile = ?,
          updated_at = datetime('now')
      WHERE id = (SELECT id FROM linkedin_sessions ORDER BY created_at DESC LIMIT 1)
    `);

    return stmt.run(
      sessionData.accessToken,
      sessionData.refreshToken || null,
      sessionData.expiresAt.toISOString(),
      sessionData.userProfile ? JSON.stringify(sessionData.userProfile) : null
    );
  }

  clearLinkedInSession() {
    return this.db.prepare('DELETE FROM linkedin_sessions').run();
  }

  isLinkedInSessionValid() {
    const session = this.getLinkedInSession();
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