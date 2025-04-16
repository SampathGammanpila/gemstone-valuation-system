// packages/backend/src/admin/controllers/system.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import adminConfig from '../../config/admin.config';
import { spawn } from 'child_process';

class SystemController {
  /**
   * Get system settings
   */
  async getSystemSettings(req: Request, res: Response) {
    try {
      // Get system settings
      const settingsQuery = `
        SELECT *
        FROM system_settings
        ORDER BY key
      `;
      
      const settings = await pool.query(settingsQuery);
      
      // Format settings into categories
      const settingsMap = settings.rows.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      }, {});
      
      res.render('system/settings', {
        title: 'System Settings',
        settingsMap
      });
    } catch (error) {
      console.error('Get system settings error:', error);
      req.flash('error', 'Failed to load system settings');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Update system settings
   */
  async updateSystemSettings(req: Request, res: Response) {
    try {
      const settings = req.body;
      
      // Start a transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Update settings
        for (const [key, value] of Object.entries(settings)) {
          if (key !== '_csrf') { // Skip CSRF token
            // Validate key to prevent SQL injection
            if (!/^[a-zA-Z0-9_.-]+$/.test(key)) {
              throw new Error(`Invalid setting key: ${key}`);
            }
            
            await client.query(
              'UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
              [value, key]
            );
          }
        }
        
        await client.query('COMMIT');
        
        // Log settings update to audit log
        await pool.query(
          `INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data, ip_address) 
           VALUES ($1, 'UPDATE', 'system_settings', NULL, NULL, $2, $3)`,
          [req.admin!.userId, 'Updated system settings', req.ip]
        );
        
        req.flash('success', 'System settings updated successfully');
        res.redirect('/admin/system/settings');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Update system settings error:', error);
      req.flash('error', 'Failed to update system settings');
      res.redirect('/admin/system/settings');
    }
  }
  
  /**
   * Get audit log
   */
  async getAuditLog(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || adminConfig.pagination.defaultLimit;
      const offset = (page - 1) * limit;
      
      // Fix SQL injection vulnerabilities in filters
      const params: any[] = [limit, offset];
      let paramCount = 3;
      
      // Optional filters with parameterized queries
      let actionFilter = '';
      let tableFilter = '';
      let dateFilter = '';
      let userFilter = '';
      
      if (req.query.action) {
        actionFilter = ` AND action_type = $${paramCount++}`;
        params.push(req.query.action);
      }
      
      if (req.query.table) {
        tableFilter = ` AND table_name = $${paramCount++}`;
        params.push(req.query.table);
      }
      
      if (req.query.date) {
        dateFilter = ` AND DATE(timestamp) = DATE($${paramCount++})`;
        params.push(req.query.date);
      }
      
      if (req.query.user_id) {
        userFilter = ` AND user_id = $${paramCount++}`;
        params.push(parseInt(req.query.user_id as string));
      }
      
      // Get audit logs with pagination
      const logsQuery = `
        SELECT al.*, u.username AS user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1 ${actionFilter} ${tableFilter} ${dateFilter} ${userFilter}
        ORDER BY al.timestamp DESC
        LIMIT $1 OFFSET $2
      `;
      
      const logs = await pool.query(logsQuery, params);
      
      // Get total count for pagination with same filters
      const countParams = params.slice(2); // Remove limit and offset
      const countPlaceholders = countParams.map((_, i) => `$${i + 1}`).join(', ');
      
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM audit_logs
        WHERE 1=1 ${actionFilter} ${tableFilter} ${dateFilter} ${userFilter}
      `;
      
      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get distinct action types for filter
      const actionsQuery = `SELECT DISTINCT action_type FROM audit_logs ORDER BY action_type`;
      const actions = await pool.query(actionsQuery);
      
      // Get distinct table names for filter
      const tablesQuery = `SELECT DISTINCT table_name FROM audit_logs ORDER BY table_name`;
      const tables = await pool.query(tablesQuery);
      
      // Get users for filter
      const usersQuery = `
        SELECT DISTINCT u.id, u.username 
        FROM users u
        JOIN audit_logs al ON u.id = al.user_id
        ORDER BY u.username
      `;
      const users = await pool.query(usersQuery);
      
      res.render('system/audit-log', {
        title: 'Audit Log',
        logs: logs.rows,
        actions: actions.rows,
        tables: tables.rows,
        users: users.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        },
        filters: {
          action: req.query.action || '',
          table: req.query.table || '',
          date: req.query.date || '',
          user_id: req.query.user_id || ''
        }
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      req.flash('error', 'Failed to load audit log');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get backup options
   */
  async getBackupOptions(req: Request, res: Response) {
    try {
      // Get list of existing backups
      const backupDir = path.join(__dirname, '../../../../database/backups');
      
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const stats = fs.statSync(path.join(backupDir, file));
          return {
            name: file,
            size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB', // Convert to MB
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime()); // Sort by newest first
      
      res.render('system/backup', {
        title: 'Database Backup and Restore',
        backups: backupFiles
      });
    } catch (error) {
      console.error('Get backup options error:', error);
      req.flash('error', 'Failed to load backup options');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Create database backup
   */
  async createBackup(req: Request, res: Response) {
    try {
      const { description } = req.body;
      
      // Validate description to prevent command injection
      if (description && !/^[a-zA-Z0-9_\s-]+$/.test(description)) {
        req.flash('error', 'Invalid backup description. Use only letters, numbers, spaces, underscores, and hyphens.');
        return res.redirect('/admin/system/backup');
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}${description ? '_' + description.replace(/\s+/g, '_') : ''}.sql`;
      const backupDir = path.join(__dirname, '../../../../database/backups');
      const backupPath = path.join(backupDir, backupFileName);
      
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Use spawn instead of exec to avoid command injection
      const pgDump = spawn('pg_dump', [
        '-h', process.env.DB_HOST || 'localhost',
        '-p', process.env.DB_PORT || '5432',
        '-U', process.env.DB_USER || 'postgres',
        '-d', process.env.DB_NAME || 'gemstone',
        '-F', 'p',
        '-f', backupPath
      ], {
        env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
      });
      
      pgDump.on('close', (code) => {
        if (code !== 0) {
          console.error(`pg_dump process exited with code ${code}`);
          req.flash('error', 'Failed to create backup');
          return res.redirect('/admin/system/backup');
        }
        
        // Log backup creation to audit log
        pool.query(
          `INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data, ip_address) 
           VALUES ($1, 'BACKUP', 'system', NULL, NULL, $2, $3)`,
          [req.admin!.userId, `Created backup: ${backupFileName}`, req.ip]
        );
        
        req.flash('success', 'Backup created successfully');
        res.redirect('/admin/system/backup');
      });
      
      pgDump.on('error', (err) => {
        console.error('Backup creation error:', err);
        req.flash('error', 'Failed to create backup');
        res.redirect('/admin/system/backup');
      });
      
    } catch (error) {
      console.error('Create backup error:', error);
      req.flash('error', 'Failed to create backup');
      res.redirect('/admin/system/backup');
    }
  }
  
  /**
   * Restore database from backup
   */
  async restoreBackup(req: Request, res: Response) {
    try {
      const { backup_file } = req.body;
      
      // Validate backup file name to prevent path traversal
      if (!backup_file || !/^[a-zA-Z0-9_.-]+\.sql$/.test(backup_file)) {
        req.flash('error', 'Invalid backup file name');
        return res.redirect('/admin/system/backup');
      }
      
      // Validate backup file
      const backupDir = path.join(__dirname, '../../../../database/backups');
      const backupPath = path.join(backupDir, backup_file);
      
      // Ensure the file exists and is within the backups directory
      if (!fs.existsSync(backupPath) || !backupPath.startsWith(backupDir)) {
        req.flash('error', 'Backup file not found or invalid');
        return res.redirect('/admin/system/backup');
      }
      
      // Use spawn instead of exec to avoid command injection
      const psql = spawn('psql', [
        '-h', process.env.DB_HOST || 'localhost',
        '-p', process.env.DB_PORT || '5432',
        '-U', process.env.DB_USER || 'postgres',
        '-d', process.env.DB_NAME || 'gemstone',
        '-f', backupPath
      ], {
        env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
      });
      
      psql.on('close', (code) => {
        if (code !== 0) {
          console.error(`psql restore process exited with code ${code}`);
          req.flash('error', 'Failed to restore from backup');
          return res.redirect('/admin/system/backup');
        }
        
        // Log restore operation to audit log
        pool.query(
          `INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data, ip_address) 
           VALUES ($1, 'RESTORE', 'system', NULL, NULL, $2, $3)`,
          [req.admin!.userId, `Restored from backup: ${backup_file}`, req.ip]
        );
        
        req.flash('success', 'Database restored successfully');
        res.redirect('/admin/system/backup');
      });
      
      psql.on('error', (err) => {
        console.error('Restore error:', err);
        req.flash('error', 'Failed to restore from backup');
        res.redirect('/admin/system/backup');
      });
      
    } catch (error) {
      console.error('Restore backup error:', error);
      req.flash('error', 'Failed to restore from backup');
      res.redirect('/admin/system/backup');
    }
  }
}

export default new SystemController();