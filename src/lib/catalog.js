const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };


// IDs of products that customers can currently see (not hidden, not deleted).
// Returns null when the catalog could not be loaded.
export async function fetchVisibleProductIds() {
  try {
    const data = await db.entities.Product.list('-created_date', 500);
    const rows = Array.isArray(data) ? data : data.items || [];
    return new Set(rows.filter((p) => !p.hidden).map((p) => p.id));
  } catch {
    return null;
  }
}