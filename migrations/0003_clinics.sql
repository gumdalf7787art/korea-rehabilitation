CREATE TABLE IF NOT EXISTS clinics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  site_url TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  consent_confirmed INTEGER NOT NULL DEFAULT 0 CHECK (consent_confirmed IN (0,1)),
  updated_at TEXT NOT NULL,
  CHECK (published=0 OR consent_confirmed=1)
);
CREATE INDEX IF NOT EXISTS clinics_directory ON clinics(published,region,name);
