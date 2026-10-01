const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const CAT_ID = { 'Leafy Greens': 'Sayuran Daun', 'Chili & Spices': 'Cabai & Rempah', 'Fruit Vegetables': 'Sayur Buah', 'Fruits': 'Buah' };
const PAY_LABEL = { cod: 'COD', virtual_account: 'Virtual Account', qris: 'QRIS', whatsapp: 'WhatsApp' };

const idr = (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');

const parseItems = (o) => {
  try {
    const a = JSON.parse(o.items_json || '[]');
    if (!Array.isArray(a)) return [];
    return a.map((it) => {
      const p = it.product || it;
      return {
        name: p.name_id || p.name || 'Produk',
        category: p.category,
        qty: Number(it.quantity ?? it.qty) || 1,
        price: Number(p.price ?? it.price) || 0,
      };
    });
  } catch {
    return [];
  }
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Admin-only when invoked manually; scheduled runs (no user) are trusted.
    let user = null;
    try {
      user = await db.auth.me();
    } catch {
      /* scheduled invocation has no user */
    }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 3600 * 1000);
    const orders = await db.asServiceRole.entities.Order.filter(
      { created_date: { $gte: from.toISOString() } },
      '-created_date',
      500
    );
    const list = Array.isArray(orders) ? orders : orders.items || [];

    const valid = list.filter((o) => o.status !== 'cancelled');
    const revenue = valid.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const aov = valid.length ? revenue / valid.length : 0;
    const byStatus = {};
    const byPay = {};
    const productMap = {};
    list.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      byPay[o.payment_method] = (byPay[o.payment_method] || 0) + 1;
      parseItems(o).forEach((it) => {
        if (!productMap[it.name]) productMap[it.name] = { name: it.name, category: it.category, qty: 0, revenue: 0 };
        productMap[it.name].qty += it.qty;
        productMap[it.name].revenue += it.price * it.qty;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const settingRows = await db.asServiceRole.entities.Setting.filter({ key: 'weekly_report_email' });
    const recipient = Array.isArray(settingRows)
      ? (settingRows[0]?.value || '')
      : (settingRows?.items?.[0]?.value || '');
    const range = `${from.toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar' })} – ${to.toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar' })}`;

    const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const cell = (s, align) => `padding:6px 8px;border:1px solid #e5e7eb${align ? `;text-align:${align}` : ''}`;
    const statusRows = Object.entries(byStatus).map(([k, v]) => `<tr><td style="${cell()}">${esc(k)}</td><td style="${cell('right')}">${v}</td></tr>`).join('');
    const payRows = Object.entries(byPay).map(([k, v]) => `<tr><td style="${cell()}">${esc(PAY_LABEL[k] || k)}</td><td style="${cell('right')}">${v}</td></tr>`).join('');
    const prodRows = topProducts.length
      ? topProducts.map((p, i) => `<tr><td style="${cell()}">${i + 1}. ${esc(p.name)}</td><td style="${cell()}">${esc(CAT_ID[p.category] || p.category || '-')}</td><td style="${cell('right')}">${p.qty}</td><td style="${cell('right')}">${idr(p.revenue)}</td></tr>`).join('')
      : '<tr><td colspan="4" style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Belum ada penjualan minggu ini.</td></tr>';

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f6f7f6;margin:0;padding:20px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#0f7b3c;color:#fff;padding:20px">
      <h1 style="margin:0;font-size:20px">Rangkuman Penjualan Mingguan</h1>
      <p style="margin:4px 0 0;opacity:0.85;font-size:13px">Etalase Belanja Tani Kota Denpasar · ${esc(range)}</p>
    </div>
    <div style="padding:20px">
      <div style="display:flex;gap:10px;margin-bottom:16px">
        <div style="flex:1;background:#ecfdf5;border-radius:8px;padding:12px;text-align:center"><div style="font-size:11px;color:#065f46">Total Pesanan</div><div style="font-size:20px;font-weight:bold;color:#065f46">${list.length}</div></div>
        <div style="flex:1;background:#ecfdf5;border-radius:8px;padding:12px;text-align:center"><div style="font-size:11px;color:#065f46">Pendapatan</div><div style="font-size:20px;font-weight:bold;color:#065f46">${idr(revenue)}</div></div>
        <div style="flex:1;background:#ecfdf5;border-radius:8px;padding:12px;text-align:center"><div style="font-size:11px;color:#065f46">Rata²/Pesanan</div><div style="font-size:18px;font-weight:bold;color:#065f46">${idr(aov)}</div></div>
      </div>
      <h2 style="font-size:15px;color:#0f7b3c;margin:0 0 8px">Produk Terlaris</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px">
        <thead><tr style="background:#f0fdf4"><th style="${cell('left')}">Produk</th><th style="${cell('left')}">Kategori</th><th style="${cell('center')}">Terjual</th><th style="${cell('right')}">Pendapatan</th></tr></thead>
        <tbody>${prodRows}</tbody>
      </table>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <h2 style="font-size:14px;color:#0f7b3c;margin:0 0 8px">Status Pesanan</h2>
          <table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>${statusRows || '<tr><td style="padding:6px;color:#6b7280">—</td></tr>'}</tbody></table>
        </div>
        <div style="flex:1">
          <h2 style="font-size:14px;color:#0f7b3c;margin:0 0 8px">Metode Bayar</h2>
          <table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>${payRows || '<tr><td style="padding:6px;color:#6b7280">—</td></tr>'}</tbody></table>
        </div>
      </div>
      <p style="font-size:11px;color:#6b7280;margin-top:18px">Laporan ini dikirim otomatis setiap Senin pukul 08.00 WITA. Buka dashboard untuk detail lengkap.</p>
    </div>
  </div>
</body></html>`;

    let sent = false;
    if (recipient) {
      await db.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject: `Rangkuman Penjualan Mingguan EBT · ${range}`,
        html,
      });
      sent = true;
    }

    return Response.json({ ok: true, sent, recipient: recipient ? 'set' : 'unset', range, orderCount: list.length, revenue, topProducts: topProducts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}