import { neon } from "@neondatabase/serverless";
import type { StoredProductEvent } from "./product-events-policy";

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Product events require DATABASE_URL");
  return neon(url);
}

export async function appendProductEvent(e: StoredProductEvent): Promise<boolean> {
  const sql = database();
  const rows = await sql`INSERT INTO product_events
    (id,name,event_key,origin,visitor_id,session_id,actor_id,account_id,lead_id,
     object_type,object_id,path,properties,environment,is_test,occurred_at)
    VALUES (${e.id},${e.name},${e.eventKey},${e.origin},${e.visitorId},${e.sessionId},
     ${e.actorId},${e.accountId},${e.leadId},${e.objectType},${e.objectId},${e.path},
     ${JSON.stringify(e.properties)}::jsonb,${e.environment},${e.isTest},${e.occurredAt.toISOString()})
    ON CONFLICT DO NOTHING RETURNING id`;
  return rows.length > 0;
}

export async function markProductEventSent(id: string): Promise<void> {
  const sql = database();
  await sql`UPDATE product_events SET vercel_sent_at=now() WHERE id=${id}`;
}
