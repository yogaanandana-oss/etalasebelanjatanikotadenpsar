import { formatIDR } from '@/lib/format';

// Editable shop payment configuration. Replace these placeholders with your real details.
export const shopConfig = {
  shopName: 'Etalase Belanja Tani Kota Denpasar',
  // Your shop's WhatsApp number in international format, digits only (e.g. 6281234567890).
  whatsappNumber: '6281234567890',
  // Your shop's bank accounts shown to customers for Virtual Account / bank transfer.
  banks: [
    { code: 'bca', name: 'Bank BCA', accountNumber: '1234567890', accountName: 'Etalase Belanja Tani Kota Denpasar' },
    { code: 'bni', name: 'Bank BNI', accountNumber: '9876543210', accountName: 'Etalase Belanja Tani Kota Denpasar' },
    { code: 'bri', name: 'Bank BRI', accountNumber: '1234567890123', accountName: 'Etalase Belanja Tani Kota Denpasar' },
    { code: 'mandiri', name: 'Bank Mandiri', accountNumber: '1357902468', accountName: 'Etalase Belanja Tani Kota Denpasar' },
    { code: 'permata', name: 'Bank Permata', accountNumber: '0123456789', accountName: 'Etalase Belanja Tani Kota Denpasar' },
  ],
  // Optional: URL to your shop's QRIS QR image. Leave empty to show a styled placeholder.
  qrisImage: '',
  qrisMerchantName: 'TaniSegar Market',
  // Voucher / loyalty program (editable from Admin Settings)
  voucherFirstTimePercent: 10, // % discount for a customer's first order
  voucherLoyaltyMinOrders: 5, // min completed/paid orders to unlock loyalty
  voucherLoyaltyMinTotal: 500000, // min cumulative spend (IDR) to unlock loyalty
  voucherLoyaltyPercent: 15, // % loyalty discount
};

export function buildOrderRef() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TSM-${ymd}-${rand}`;
}

export function paymentLabel(method, bankCode) {
  const bank = shopConfig.banks.find((b) => b.code === bankCode);
  if (method === 'cod') return 'COD (Bayar di Tempat)';
  if (method === 'virtual_account') return bank ? `Transfer ${bank.name} (Virtual Account)` : 'Transfer Bank';
  if (method === 'qris') return 'QRIS';
  return method;
}

export function buildOrderMessage({ orderRef, customer, items, total, method, bank }) {
  const lines = [
    `*Pesanan Baru - ${shopConfig.shopName}*`,
    `Ref: ${orderRef}`,
    `Nama: ${customer.name}`,
    `No. HP: ${customer.phone}`,
    `Alamat: ${customer.address}`,
    ``,
    `Pesanan:`,
    ...items.map((i) => {
      const label = `- ${i.product.name_id || i.product.name} (${i.product.name}) x${i.quantity} = ${formatIDR(i.product.price * i.quantity)}`;
      return i.product.in_stock ? label : `${label} (Pre-Order)`;
    }),
    ``,
    `Total: ${formatIDR(total)}`,
    `Pembayaran: ${paymentLabel(method, bank)}`,
  ];
  return lines.join('\n');
}

export function buildConfirmMessage({ orderRef, total, method, bank }) {
  return [
    `*Konfirmasi Pembayaran - ${shopConfig.shopName}*`,
    `Ref: ${orderRef}`,
    `Total: ${formatIDR(total)}`,
    `Metode: ${paymentLabel(method, bank)}`,
    ``,
    `Saya sudah melakukan pembayaran untuk pesanan di atas. Mohon diverifikasi. Terima kasih.`,
  ].join('\n');
}

// Message sent FROM the shop TO the customer (opened on the customer's number).
export function buildCustomerMessage({ orderRef, customerName, total, status, method, bank }) {
  const statusMeta = {
    pending: 'Pesanan Anda telah kami terima dan sedang menunggu pembayaran.',
    paid: 'Pembayaran Anda telah kami terima, pesanan sedang diproses.',
    processing: 'Pesanan Anda sedang kami siapkan.',
    shipped: 'Pesanan Anda sedang dalam perjalanan. Mohon siap untuk menerima.',
    completed: 'Pesanan Anda telah selesai. Terima kasih telah berbelanja!',
    cancelled: 'Pesanan Anda telah dibatalkan. Hubungi kami jika ada pertanyaan.',
    expired: 'Pesanan Anda telah kedaluwarsa. Silakan pesan kembali.',
  };
  return [
    `*${shopConfig.shopName} - Konfirmasi Pesanan*`,
    ``,
    `Halo ${customerName},`,
    ``,
    statusMeta[status] || statusMeta.pending,
    ``,
    `Ref Pesanan: ${orderRef}`,
    `Total: ${formatIDR(total)}`,
    `Pembayaran: ${paymentLabel(method, bank)}`,
    ``,
    `Terima kasih telah berbelanja di ${shopConfig.shopName}.`,
  ].join('\n');
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${shopConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}