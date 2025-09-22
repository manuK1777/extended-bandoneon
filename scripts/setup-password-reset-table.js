#!/usr/bin/env node

/**
 * Script to create the password_resets table
 * Run with: node scripts/setup-password-reset-table.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createPasswordResetTable() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
    if (!connectionUrl) {
      throw new Error('❌ Database URL not found in environment variables');
    }
    
    connection = await mysql.createConnection(connectionUrl);
    
    console.log('✅ Connected to database');
    
    // Create the password_resets table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    console.log('📝 Creating password_resets table...');
    await connection.execute(createTableSQL);
    
    // Create cleanup index
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_password_resets_cleanup 
      ON password_resets (expires_at, used)
    `;
    
    console.log('📝 Creating cleanup index...');
    await connection.execute(createIndexSQL);
    
    console.log('✅ Password reset table created successfully!');
    console.log('🎉 You can now test the password reset functionality');
    
  } catch (error) {
    console.error('❌ Error creating password reset table:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
createPasswordResetTable();
