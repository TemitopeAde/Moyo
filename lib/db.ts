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
      finished_images TEXT[] DEFAULT ARRAY[]::TEXT[],
      payment_verified BOOLEAN DEFAULT FALSE,
      payment_url TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      list_type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      unsubscribe_token TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMPTZ DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ,
      last_emailed_at TIMESTAMPTZ,
      UNIQUE(email, list_type)
    );

    CREATE TABLE IF NOT EXISTS photography_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS photography_category_images (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES photography_categories(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      title TEXT DEFAULT '',
      alt_text TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE galleries
      ADD COLUMN IF NOT EXISTS finished_images TEXT[] DEFAULT ARRAY[]::TEXT[],
      ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS payment_url TEXT DEFAULT '';
  `);

  await pool.query(`
    UPDATE galleries
    SET images = COALESCE(images, ARRAY[]::TEXT[]),
        approved_images = COALESCE(approved_images, ARRAY[]::TEXT[]),
        finished_images = COALESCE(finished_images, ARRAY[]::TEXT[]);
  `);

  // seed singleton rows
  await pool.query(`INSERT INTO content (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
  await pool.query(`INSERT INTO contact (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
}

export async function query(text: string, params?: unknown[]) {
  await ensureTables();
  return pool.query(text, params);
}
