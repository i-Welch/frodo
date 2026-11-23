CREATE TABLE IF NOT EXISTS product_events (
  id uuid PRIMARY KEY, name text NOT NULL, event_key text, origin text NOT NULL,
  visitor_id uuid, session_id uuid, actor_id text, account_id text, lead_id text,
  object_type text, object_id text, path text, properties jsonb NOT NULL,
  environment text NOT NULL, is_test boolean NOT NULL DEFAULT false, occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), vercel_sent_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS product_events_name_key_uq ON product_events(name,event_key);
CREATE INDEX IF NOT EXISTS product_events_name_created_idx ON product_events(name,created_at);
CREATE INDEX IF NOT EXISTS product_events_visitor_created_idx ON product_events(visitor_id,created_at);
CREATE INDEX IF NOT EXISTS product_events_lead_idx ON product_events(lead_id);
CREATE INDEX IF NOT EXISTS product_events_account_idx ON product_events(account_id);
