'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Clock, CheckCircle2, Truck, PackageCheck, XCircle,
  ChevronRight, ShoppingBag,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface OrderItem {
  _id: string;
  tenSanPham: string;
  hinhAnh: string;
  gia: number;
  soLuong: number;
  variant: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  receiverName: string;
  tongThanhToan: number;
  trangThai: 'cho_xac_nhan' | 'da_xac_nhan' | 'dang_giao' | 'da_giao' | 'da_huy';
  createdAt: string;
}

type StatusKey = Order['trangThai'];

const STATUS: Record<StatusKey, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  cho_xac_nhan: { label: 'Chờ xác nhận', bg: 'bg-amber-50',  text: 'text-amber-600',  Icon: Clock },
  da_xac_nhan:  { label: 'Đã xác nhận',  bg: 'bg-blue-50',   text: 'text-blue-600',   Icon: CheckCircle2 },
  dang_giao:    { label: 'Đang giao',     bg: 'bg-purple-50', text: 'text-purple-600', Icon: Truck },
  da_giao:      { label: 'Đã giao',       bg: 'bg-green-50',  text: 'text-green-600',  Icon: PackageCheck },
  da_huy:       { label: 'Đã hủy',        bg: 'bg-red-50',    text: 'text-red-500',    Icon: XCircle },
};

type TabKey = 'all' | StatusKey;
const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',          label: 'Tất cả' },
  { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
  { key: 'da_xac_nhan',  label: 'Đã xác nhận' },
  { key: 'dang_giao',    label: 'Đang giao' },
  { key: 'da_giao',      label: 'Đã giao' },
  { key: 'da_huy',       label: 'Đã hủy' },
];

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('smarthub_token') || '' : '';

export default function DonHangPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace('/login'); return; }
    fetch(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) setOrders(d.orders);
        else router.replace('/login');
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = tab === 'all' ? orders : orders.filter(o => o.trangThai === tab);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-red-500 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/nguoidung" className="hover:text-red-500 transition-colors">Tài khoản</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 font-medium">Đơn hàng của tôi</span>
      </nav>

      {/* Main list card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-800">Đơn hàng của tôi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Theo dõi và quản lý đơn hàng</p>
        </div>

        {/* Status tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-2 [scrollbar-width:none]">
          {TABS.map(t => {
            const count = t.key === 'all' ? 0 : orders.filter(o => o.trangThai === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.key !== 'all' && count > 0 && (
                  <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                    tab === t.key ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Order list */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Package className="w-9 h-9 text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold">Không có đơn hàng nào</p>
              <p className="text-sm text-gray-400 mt-1.5">
                {tab === 'all'
                  ? 'Hãy mua sắm và quay lại đây để theo dõi đơn hàng'
                  : 'Không có đơn hàng ở trạng thái này'}
              </p>
              {tab === 'all' && (
                <Link href="/sanpham" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">
                  <ShoppingBag className="w-4 h-4" />Mua sắm ngay
                </Link>
              )}
            </div>
          ) : (
            filtered.map(order => {
              const s = STATUS[order.trangThai];
              const first = order.items[0];
              return (
                <div key={order._id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                  {/* Meta row */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        #{order._id.slice(-10).toUpperCase()}
                      </span>
                      <span className="text-gray-300 hidden sm:block">·</span>
                      <span className="text-xs text-gray-400 hidden sm:block">{fmtDate(order.createdAt)}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${s.bg} ${s.text}`}>
                      <s.Icon className="w-3.5 h-3.5" />{s.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 sm:hidden">{fmtDate(order.createdAt)}</p>

                  {/* Product + price + CTA */}
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    {first.hinhAnh ? (
                      <img
                        src={first.hinhAnh}
                        alt={first.tenSanPham}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-7 h-7 text-gray-300" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{first.tenSanPham}</p>
                      {first.variant && <p className="text-xs text-gray-400 mt-0.5">{first.variant}</p>}
                      <p className="text-xs text-gray-400 mt-1">Số lượng: {first.soLuong}</p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">+{order.items.length - 1} sản phẩm khác</p>
                      )}
                    </div>

                    {/* Price + button */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Tổng tiền</p>
                        <p className="text-lg font-bold text-red-500">{fmt(order.tongThanhToan)}</p>
                      </div>
                      <Link
                        href={`/don-hang/${order._id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                      >
                        Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
