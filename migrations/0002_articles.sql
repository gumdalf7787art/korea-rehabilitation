CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK(section IN ('news','insurance')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  effective_on TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS articles_list ON articles(published,section,updated_at DESC);
