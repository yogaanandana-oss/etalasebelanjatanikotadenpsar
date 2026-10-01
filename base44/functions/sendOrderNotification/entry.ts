const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const METHOD_LABELS = {
  cod: 'COD (Bayar di Tempat)',
  virtual_account: 'Transfer Bank (VA)',
  qris: 'QRIS',
};

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      orderRef, customerName, customerPhone, deliveryAddress,
      itemsSummary, total, paymentMethod,
    } = body || {};

    if (!orderRef) {
      return Response.json({ error: 'orderRef required' }, { status: 400 });
    }

    const rows = await db.asServiceRole.entities.Setting.filter({ key: 'order_notification_email' });
    const recipient = Array.isArray(rows)
      ? (rows[0]?.value || '')
      : (rows?.items?.[0]?.value || '');

    if (!recipient) {
      return Response.json({ ok: true, sent: false, reason: 'no_email_configured' });
    }

    const methodLabel = METHOD_LABELS[paymentMethod] || paymentMethod || '-';
    const totalFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(total) || 0);
    const shopName = 'Etalase Belanja Tani Kota Denpasar';

    const subject = `Pesanan Baru ${orderRef} - ${shopName}`;
    const text = [
      `Pesanan baru masuk di ${shopName}.`,
      ``,
      `Ref Pesanan : ${orderRef}`,
      `Nama        : ${customerName || '-'}`,
      `No. HP      : ${customerPhone || '-'}`,
      `Alamat      : ${deliveryAddress || '-'}`,
      `Pembayaran  : ${methodLabel}`,
      `Total       : ${totalFmt}`,
      ``,
      `Item:`,
      itemsSummary || '-',
      ``,
      `Segera proses pesanan ini. Terima kasih.`,
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#0f7b46;color:#fff;padding:16px 20px">
          <h2 style="margin:0;font-size:18px">Pesanan Baru Masuk</h2>
          <p style="margin:2px 0 0;opacity:.85;font-size:13px">${shopName}</p>
        </div>
        <div style="padding:20px;color:#111827;font-size:14px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#6b7280;width:120px">Ref Pesanan</td><td style="padding:6px 0;font-weight:600">${escapeHtml(orderRef)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Nama</td><td style="padding:6px 0;font-weight:600">${escapeHtml(customerName)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">No. HP</td><td style="padding:6px 0;font-weight:600">${escapeHtml(customerPhone)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Alamat</td><td style="padding:6px 0;font-weight:600">${escapeHtml(deliveryAddress)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Pembayaran</td><td style="padding:6px 0;font-weight:600">${escapeHtml(methodLabel)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Total</td><td style="padding:6px 0;font-weight:700;font-size:16px">${escapeHtml(totalFmt)}</td></tr>
          </table>
          <div style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:12px">
            <p style="margin:0 0 6px;color:#6b7280">Item:</p>
            <p style="margin:0;white-space:pre-line">${escapeHtml(itemsSummary)}</p>
          </div>
          <p style="margin-top:16px;color:#0f7b46;font-weight:600">Segera proses pesanan ini. Terima kasih.</p>
        </div>
      </div>
    `;

    await db.asServiceRole.integrations.Core.SendEmail({
      to: recipient,
      subject,
      html,
      text,
    });

    return Response.json({ ok: true, sent: true, recipient });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}