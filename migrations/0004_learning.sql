ALTER TABLE events ADD COLUMN priority_opens_at TEXT;

CREATE TABLE saved_files (
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  saved_at TEXT NOT NULL,
  PRIMARY KEY(member_id,file_id)
);
CREATE TABLE watch_progress (
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  seconds INTEGER NOT NULL CHECK(seconds>=0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(member_id,file_id)
);
