#!/usr/bin/env node
/**
 * Database Bootstrap Script
 * 
 * This script runs database migrations against Supabase.
 * It requires the SUPABASE_DB_PASSWORD environment variable to be set.
 * 
 * Usage:
 * SUPABASE_DB_PASSWORD=xxx node scripts/bootstrap-db.js
 * 
 * OR run the SQL files manually in the Supabase SQL editor at:
 * https://supabase.com/dashboard/project/ztutqkqfcbpdwiwaeffj/sql/new
 */

const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

const PROJECT_REF = 'ztutqkqfcbpdwiwaeffj';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('Please provide SUPABASE_DB_PASSWORD environment variable');
  console.error('Get the database password from: https://supabase.com/dashboard/project/ztutqkqfcbpdwiwaeffj/settings/database');
  console.error('');
  console.error('Alternatively, run the SQL files manually in the Supabase SQL editor:');
  console.error('https://supabase.com/dashboard/project/ztutqkqfcbpdwiwaeffj/sql/new');
  console.error('');
  console.error('Files to run in order:');
  console.error('  1. supabase/migrations/001_initial_schema.sql');
  console.error('  2. supabase/migrations/002_seed_firms.sql');
  process.exit(1);
}

const DB_URL = `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`;

const migrations = [
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_seed_firms.sql',
];

for (const migration of migrations) {
  const sql = readFileSync(join(__dirname, '..', migration), 'utf8');
  console.log(`Running ${migration}...`);
  try {
    execSync(`psql "${DB_URL}" -f "${join(__dirname, '..', migration)}"`, { stdio: 'inherit' });
    console.log(`✓ ${migration} completed`);
  } catch (err) {
    console.error(`✗ ${migration} failed:`, err.message);
    process.exit(1);
  }
}

console.log('✓ All migrations completed successfully!');
