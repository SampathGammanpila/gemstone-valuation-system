// packages/backend/src/admin/controllers/system.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import adminConfig from '../../config/admin.config';

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
            await client.query(
              'UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
              [value, key]
            );
          }
        }
        
        await client.query('COMMIT');
        
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
      
      // Optional filters
      const actionFilter = req.query.action ? ` AND action_type = '${req.query.action}'` : '';
      const tableFilter = req.query.table ? ` AND table_name = '${req.query.table}'` : '';
      const dateFilter = req.query.date 
        ? ` AND DATE(timestamp) = DATE('${req.query.date}')` 
        : '';
      const userFilter = req.query.user_id 
        ? ` AND user_id = ${parseInt(req.query.user_id as string)}` 
        : '';
      
      // Get audit logs with pagination
      const logsQuery = `
        SELECT al.*, u.username AS user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1 ${actionFilter} ${tableFilter} ${dateFilter} ${userFilter}
        ORDER BY al.timestamp DESC
        LIMIT $1 OFFSET $2
      `;
      
      const logs = await pool.query(logsQuery, [limit, offset]);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM audit_logs
        WHERE 1=1 ${actionFilter} ${tableFilter} ${dateFilter} ${userFilter}
      `;
      
      const countResult = await pool.query(countQuery);
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
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}${description ? '_' + description.replace(/\s+/g, '_') : ''}.sql`;
      const backupDir = path.join(__dirname, '../../../../database/backups');
      const backupPath = path.join(backupDir, backupFileName);
      
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Build pg_dump command
      const pgDumpCmd = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F p -f "${backupPath}"`;
      
      // Execute backup command
      exec(pgDumpCmd, (error) => {
        if (error) {
          console.error('Backup creation error:', error);
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
      
      // Validate backup file
      const backupDir = path.join(__dirname, '../../../../database/backups');
      const backupPath = path.join(backupDir, backup_file);
      
      if (!fs.existsSync(backupPath)) {
        req.flash('error', 'Backup file not found');
        return res.redirect('/admin/system/backup');
      }
      
      // Build psql restore command
      const restoreCmd = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f "${backupPath}"`;
      
      // Execute restore command
      exec(restoreCmd, (error) => {
        if (error) {
          console.error('Restore error:', error);
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
    } catch (error) {
      console.error('Restore backup error:', error);
      req.flash('error', 'Failed to restore from backup');
      res.redirect('/admin/system/backup');
    }
  }
}

export default new SystemController();