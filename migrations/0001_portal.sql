PRAGMA foreign_keys = ON;

CREATE TABLE members (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'staff')),
  approved_at TEXT,
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX attempts_expiry ON attempts(expires_at);
CREATE TABLE dues (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_at TEXT NOT NULL,
  confirmed_by TEXT NOT NULL REFERENCES members(id),
  UNIQUE (member_id,year)
);
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  opens_at TEXT NOT NULL,
  closes_at TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity > 0),
  members_only INTEGER NOT NULL DEFAULT 0 CHECK(members_only IN (0,1)),
  fee INTEGER NOT NULL DEFAULT 0 CHECK(fee >= 0),
  published INTEGER NOT NULL DEFAULT 1 CHECK(published IN (0,1)),
  updated_at TEXT NOT NULL,
  CHECK(opens_at < closes_at AND closes_at <= ends_at AND starts_at < ends_at)
);
CREATE INDEX events_public ON events(published,starts_at);
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id),
  member_id TEXT NOT NULL REFERENCES members(id),
  status TEXT NOT NULL CHECK(status IN ('registered','waiting','cancelled')),
  fee INTEGER NOT NULL DEFAULT 0,
  paid_at TEXT,
  attended_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(event_id,member_id)
);
CREATE INDEX registrations_event ON registrations(event_id,status,created_at);
CREATE TABLE consultations (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  category TEXT NOT NULL CHECK(category IN ('법률상담','회원 고충','공동구매 문의','사무국 문의')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '접수',
  response TEXT,
  answered_by TEXT REFERENCES members(id),
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX consultations_member ON consultations(member_id,created_at);
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  speaker TEXT NOT NULL DEFAULT '',
  event_id TEXT REFERENCES events(id),
  access TEXT NOT NULL CHECK(access IN ('public','member')),
  kind TEXT NOT NULL CHECK(kind IN ('lecture','insurance','form','other')),
  mime TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX files_kind ON files(kind,access,created_at);
