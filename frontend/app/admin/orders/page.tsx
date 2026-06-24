"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, RefreshCw, Eye, X, Package, ChevronDown,
  User, MapPin, CreditCard, Banknote, AlertTriangle, CheckCircle2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OrderItem {
  _id: string;
  productId: string;
  tenSanPham: string;
  hinhAnh: string;
  gia: number;
  soLuong: number;
  variant: string;
}

interface Order {
  _id: string;
  userId: { _id: string; hoTen: string; soDienThoai?: string; email?: string } | null;
  items: OrderItem[];
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  paymentMethod: "cod" | "banking";
  tongTien: number;
  phiGiaoHang: number;
  tongThanhToan: number;
  ghiChu: string;
  trangThai: "cho_xac_nhan" | "da_xac_nhan" | "dang_giao" | "da_giao" | "da_huy";
  createdAt: string;
}

type StatusKey = Order["trangThai"];

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS: Record<StatusKey, { label: string; bg: string; color: string; border: string; dot: string }> = {
  cho_xac_nhan: { label: "Chờ xác nhận", bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", dot: "#D97706" },
  da_xac_nhan:  { label: "Đã xác nhận",  bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", dot: "#2563EB" },
  dang_giao:    { label: "Đang giao",     bg: "#F5F3FF", color: "#5B21B6", border: "#DDD6FE", dot: "#7C3AED" },
  da_giao:      { label: "Đã giao",       bg: "#F0FDF4", color: "#166534", border: "#BBF7D0", dot: "#15803D" },
  da_huy:       { label: "Đã hủy",        bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", dot: "#DC2626" },
};

const STATUS_OPTIONS: { value: StatusKey; label: string }[] = [
  { value: "cho_xac_nhan", label: "Chờ xác nhận" },
  { value: "da_xac_nhan",  label: "Đã xác nhận" },
  { value: "dang_giao",    label: "Đang giao" },
  { value: "da_giao",      label: "Đã giao" },
  { value: "da_huy",       label: "Đã hủy" },
];

type TabKey = "all" | StatusKey;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",          label: "Tất cả" },
  { key: "cho_xac_nhan", label: "Chờ xác nhận" },
  { key: "da_xac_nhan",  label: "Đã xác nhận" },
  { key: "dang_giao",    label: "Đang giao" },
  { key: "da_giao",      label: "Đã giao" },
  { key: "da_huy",       label: "Đã hủy" },
];

const TABLE_COLS = ["Mã đơn", "Khách hàng", "Sản phẩm", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày đặt", "Thao tác"];

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt     = (n: number | undefined | null) => ((n ?? 0).toLocaleString("vi-VN")) + "₫";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("smarthub_token") || "" : "";

// ── Order Detail Modal ─────────────────────────────────────────────────────────

function OrderDetailModal({
  order, onClose, onStatusChange, updating,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, s: StatusKey) => void;
  updating: string | null;
}) {
  const s = STATUS[order.trangThai];
  const canUpdate = order.trangThai !== "da_giao" && order.trangThai !== "da_huy";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Chi tiết đơn hàng</h2>
            <p className="text-[11.5px] text-gray-400 mt-0.5 font-mono">#{order._id.slice(-12).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status + date */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-full border"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
              {s.label}
            </span>
            <span className="text-xs text-gray-400">{fmtDate(order.createdAt)}</span>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F5] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#D32F2F]" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Khách hàng</p>
              <p className="text-[13.5px] font-semibold text-gray-800">{order.userId?.hoTen || order.receiverName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{order.userId?.soDienThoai || order.phone}</p>
              {order.userId?.email && <p className="text-[12px] text-gray-400">{order.userId.email}</p>}
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2">
              Sản phẩm ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item._id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  {item.hinhAnh ? (
                    <img
                      src={item.hinhAnh}
                      alt={item.tenSanPham}
                      className="w-11 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800 line-clamp-1">{item.tenSanPham}</p>
                    {item.variant && (
                      <span className="inline-block mt-0.5 text-[11px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                        {item.variant}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-gray-800">{fmt(item.gia)}</p>
                    <p className="text-[11px] text-gray-400">x{item.soLuong}</p>
                    <p className="text-[12px] font-semibold text-[#D32F2F]">{fmt(item.gia * item.soLuong)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#D32F2F]" />
                <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide">Địa chỉ nhận</p>
              </div>
              <p className="text-[13px] font-semibold text-gray-800">{order.receiverName}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{order.phone}</p>
              <p className="text-[11.5px] text-gray-400 mt-1.5 leading-relaxed">
                {order.detailAddress}, {order.ward}, {order.district}, {order.province}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                {order.paymentMethod === "cod"
                  ? <Banknote className="w-3.5 h-3.5 text-green-500" />
                  : <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide">Thanh toán</p>
              </div>
              <p className="text-[13px] font-medium text-gray-700 mb-3">
                {order.paymentMethod === "cod" ? "COD (Khi nhận hàng)" : "Chuyển khoản ngân hàng"}
              </p>
              <div className="space-y-1.5 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-[12px] text-gray-500">
                  <span>Tạm tính</span><span>{fmt(order.tongTien)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-gray-500">
                  <span>Phí ship</span>
                  <span className={order.phiGiaoHang === 0 ? "text-green-600 font-medium" : ""}>
                    {order.phiGiaoHang === 0 ? "Miễn phí" : fmt(order.phiGiaoHang)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] font-bold border-t border-gray-200 pt-1.5">
                  <span className="text-gray-700">Tổng cộng</span>
                  <span style={{ color: "#D32F2F" }}>{fmt(order.tongThanhToan)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.ghiChu && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-1">Ghi chú</p>
              <p className="text-[13px] text-gray-700">{order.ghiChu}</p>
            </div>
          )}

          {/* Update status */}
          {canUpdate && (
            <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
              <p className="text-[13px] text-gray-600 font-medium shrink-0">Cập nhật trạng thái:</p>
              <div className="relative flex-1">
                <select
                  value={order.trangThai}
                  onChange={e => onStatusChange(order._id, e.target.value as StatusKey)}
                  disabled={updating === order._id}
                  className="w-full text-[13px] border border-gray-200 rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#D32F2F] bg-white cursor-pointer appearance-none disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {updating === order._id && (
                <div className="w-5 h-5 border-2 border-[#D32F2F] border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<TabKey>("all");
  const [search, setSearch]   = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [detail, setDetail]   = useState<Order | null>(null);
  const [toast, setToast]     = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/orders/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      showToast("error", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: StatusKey) => {
    setUpdating(id);
    try {
      const res  = await fetch(`${API_BASE}/api/orders/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ trangThai: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, trangThai: newStatus } : o));
        if (detail?._id === id) setDetail(prev => prev ? { ...prev, trangThai: newStatus } : null);
        showToast("success", "Đã cập nhật trạng thái đơn hàng");
      } else {
        showToast("error", data.message || "Có lỗi xảy ra");
      }
    } catch {
      showToast("error", "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders
    .filter(o => tab === "all" || o.trangThai === tab)
    .filter(o => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o._id.toLowerCase().includes(q) ||
        (o.userId?.hoTen || "").toLowerCase().includes(q) ||
        o.receiverName.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    });

  const statsData = [
    { label: "Tổng đơn",       value: orders.length,                                             bg: "#FFFFFF", color: "#111827", border: "#E5E7EB" },
    { label: "Chờ xác nhận",   value: orders.filter(o => o.trangThai === "cho_xac_nhan").length, bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    { label: "Đã xác nhận",    value: orders.filter(o => o.trangThai === "da_xac_nhan").length,  bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
    { label: "Đang giao",      value: orders.filter(o => o.trangThai === "dang_giao").length,    bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    { label: "Đã giao",        value: orders.filter(o => o.trangThai === "da_giao").length,      bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
    { label: "Đã hủy",         value: orders.filter(o => o.trangThai === "da_huy").length,       bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-[13px] font-semibold transition-all ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-[12.5px] text-gray-400 mt-1">
            Trang chủ / <span className="text-gray-700 font-medium">Quản lý đơn hàng</span>
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-600 hover:border-[#D32F2F] hover:text-[#D32F2F] hover:bg-[#FFF5F5] transition-colors disabled:opacity-50 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {statsData.map(({ label, value, bg, color, border }) => (
          <div
            key={label}
            className="rounded-2xl border px-4 py-3.5 shadow-sm"
            style={{ background: bg, borderColor: border }}
          >
            <p className="text-[24px] font-bold leading-none" style={{ color }}>{value}</p>
            <p className="text-[11.5px] text-gray-500 mt-1.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-2 border border-gray-200 flex-1 max-w-xs focus-within:border-[#D32F2F] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-gray-800 w-full placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[12px] text-gray-400 ml-auto">
            Hiển thị <span className="font-semibold text-gray-700">{filtered.length}</span> / {orders.length} đơn hàng
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 px-3 [scrollbar-width:none]">
          {TABS.map(t => {
            const count = t.key === "all"
              ? orders.length
              : orders.filter(o => o.trangThai === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-4 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.key
                    ? "border-[#D32F2F] text-[#D32F2F]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-red-100 text-[#D32F2F]" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-[3px] border-[#D32F2F] border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-[13.5px] text-gray-500 font-medium">Không có đơn hàng nào</p>
            <p className="text-[12px] text-gray-400 mt-1">
              {search ? "Thử tìm kiếm với từ khóa khác" : "Không có đơn hàng ở trạng thái này"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {TABLE_COLS.map(h => (
                    <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => {
                  const s     = STATUS[order.trangThai];
                  const first = order.items[0];
                  const canUpdate = order.trangThai !== "da_giao" && order.trangThai !== "da_huy";

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Mã đơn */}
                      <td className="px-5 py-3.5">
                        <p className="text-[12.5px] font-mono font-bold text-[#D32F2F]">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                      </td>

                      {/* Khách hàng */}
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-gray-800 truncate max-w-[120px]">
                          {order.userId?.hoTen || order.receiverName}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[120px]">
                          {order.userId?.soDienThoai || order.phone}
                        </p>
                      </td>

                      {/* Sản phẩm */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {first?.hinhAnh ? (
                            <img
                              src={first.hinhAnh}
                              alt={first.tenSanPham}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-medium text-gray-700 truncate max-w-[140px]">
                              {first?.tenSanPham || "—"}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-[11px] text-gray-400">+{order.items.length - 1} sản phẩm</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tổng tiền */}
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-bold text-gray-900 tabular-nums">{fmt(order.tongThanhToan)}</p>
                        {order.phiGiaoHang === 0 && (
                          <p className="text-[10.5px] text-green-600 mt-0.5">Miễn phí ship</p>
                        )}
                      </td>

                      {/* Thanh toán */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center text-[11.5px] font-medium px-2 py-1 rounded-lg border ${
                          order.paymentMethod === "cod"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full border"
                          style={{ background: s.bg, color: s.color, borderColor: s.border }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                          {s.label}
                        </span>
                      </td>

                      {/* Ngày đặt */}
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] text-gray-500 tabular-nums">{fmtDate(order.createdAt)}</p>
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* View detail */}
                          <button
                            onClick={() => setDetail(order)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#D32F2F] hover:text-[#D32F2F] hover:bg-[#FFF5F5] transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick status dropdown */}
                          {canUpdate && (
                            <div className="relative">
                              <select
                                value={order.trangThai}
                                onChange={e => handleStatusChange(order._id, e.target.value as StatusKey)}
                                disabled={updating === order._id}
                                className="text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 pr-7 outline-none focus:border-[#D32F2F] bg-white cursor-pointer appearance-none disabled:opacity-50 transition-colors hover:border-gray-300"
                              >
                                {STATUS_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {updating === order._id ? (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#D32F2F] border-t-transparent rounded-full animate-spin pointer-events-none" />
                              ) : (
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </div>
  );
}
