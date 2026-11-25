CREATE TABLE legacy_board_posts (
  board TEXT NOT NULL CHECK (board IN ('notices', 'insurance', 'archive')),
  uid TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  views INTEGER,
  body TEXT NOT NULL,
  source_url TEXT NOT NULL,
  attachments TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY (board, uid)
);
CREATE INDEX legacy_board_date ON legacy_board_posts(board, date DESC);
