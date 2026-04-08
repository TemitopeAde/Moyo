import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

let initialized = false;

async function ensureTables() {
  if (initialized) return;
  initialized = true;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS artworks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      is_featured BOOLEAN DEFAULT FALSE,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS galleries (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      access_code TEXT NOT NULL,
      client_name TEXT NOT NULL,
      images TEXT[] DEFAULT ARRAY[]::TEXT[],
      approved_images TEXT[] DEFAULT ARRAY[]::TEXT[],
      is_locked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS content (
      id SERIAL PRIMARY KEY,
      homepage_hero_text TEXT DEFAULT '',
      homepage_hero_image TEXT DEFAULT '',
      about_text TEXT DEFAULT '',
      about_image TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS contact (
      id SERIAL PRIMARY KEY,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id SERIAL PRIMARY KEY,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      items JSONB DEFAULT '[]'::JSONB,
      total_price NUMERIC NOT NULL,
      status TEXT DEFAULT 'pending',
      customer_email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // seed singleton rows
  await pool.query(`INSERT INTO content (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
  await pool.query(`INSERT INTO contact (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
}

export async function query(text: string, params?: any[]) {
  await ensureTables();
  return pool.query(text, params);
}
