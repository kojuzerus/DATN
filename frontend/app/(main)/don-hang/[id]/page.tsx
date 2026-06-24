'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, CheckCircle2, Truck, PackageCheck, XCircle,
  ChevronRight, MapPin, CreditCard, FileText, Check,
  AlertTriangle, Banknote, ArrowLeft, ClipboardList, Smartphone,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface OrderItem {
  _id: string;
  productId: string;
  tenSanPham: string;
  hinhAnh: string;
  gia: number;
  soLuong: number;
  variant: string;
}

interface PaymentInfo {
  transactionNo: string;
  bankCode: string;
  payDate: string;
  responseCode: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  paymentMethod: 'cod' | 'banking' | 'vnpay' | 'momo';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentInfo?: PaymentInfo;
  tongTien: number;
  phiGiaoHang: number;
  tongThanhToan: number;
  ghiChu: string;
  trangThai: 'cho_xac_nhan' | 'da_xac_nhan' | 'dang_giao' | 'da_giao' | 'da_huy';
  createdAt: string;
}

const STATUS_BADGE = {
  cho_xac_nhan: { label: 'Chờ xác nhận', bg: 'bg-amber-100',  text: 'text-amber-700' },
  da_xac_nhan:  { label: 'Đã xác nhận',  bg: 'bg-blue-100',   text: 'text-blue-700' },
  dang_giao:    { label: 'Đang giao',     bg: 'bg-purple-100', text: 'text-purple-700' },
  da_giao:      { label: 'Đã giao',       bg: 'bg-green-100',  text: 'text-green-700' },
  da_huy:       { label: 'Đã hủy',        bg: 'bg-red-100',    text: 'text-red-600' },
} as const;

// Shopee-style stepper steps
const STEPS: { key: string; label: string; sub: string; Icon: React.ElementType }[] = [
  { key: 'cho_xac_nhan', label: 'Đơn hàng đã đặt',  sub: 'Chờ xác nhận',      Icon: ClipboardList },
  { key: 'da_xac_nhan',  label: 'Đã xác nhận',       sub: 'Cửa hàng xác nhận', Icon: CheckCircle2 },
  { key: 'dang_giao',    label: 'Đang giao hàng',    sub: 'Trên đường giao',   Icon: Truck },
  { key: 'da_giao',      label: 'Giao hàng thành công', sub: 'Đã nhận hàng',   Icon: PackageCheck },
];

const STEP_INDEX: Record<string, number> = {
  cho_xac_nhan: 0,
  da_xac_nhan:  1,
  dang_giao:    2,
  da_giao:      3,
};

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('smarthub_token') || '' : '';

export default function DonHangChiTietPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchOrder = useCallback(async () => {
    const token = getToken();
    if (!token) { router.replace('/login'); return; }
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrder(data.order);
      else router.replace('/don-hang');
    } catch {
      router.replace('/don-hang');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setShowConfirm(false);
      } else {
        setCancelError(data.message || 'Không thể hủy đơn hàng');
      }
    } catch {
      setCancelError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Đang tải...</p>
      </div>
    </div>
  );

  if (!order) return null;

  const isCancelled = order.trangThai === 'da_huy';
  const currentStep = STEP_INDEX[order.trangThai] ?? -1;
  const badge = STATUS_BADGE[order.trangThai];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
        <Link href="/" className="hover:text-red-500 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/nguoidung" className="hover:text-red-500 transition-colors">Tài khoản</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/don-hang" className="hover:text-red-500 transition-colors">Đơn hàng</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 font-medium">#{order._id.slice(-10).toUpperCase()}</span>
      </nav>

      {/* ── Status Card with Stepper ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h1 className="text-base font-bold text-gray-800">
              Mã đơn: <span className="font-mono">#{order._id.slice(-10).toUpperCase()}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center text-sm font-semibold px-4 py-1.5 rounded-full ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>

        {/* ── Shopee-style Stepper ── */}
        {isCancelled ? (
          <div className="mx-6 my-6 flex items-center gap-4 bg-red-50 rounded-2xl border border-red-100 px-6 py-5">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-600 text-base">Đơn hàng đã bị hủy</p>
              <p className="text-sm text-red-400 mt-0.5">Đơn hàng này đã được hủy thành công</p>
            </div>
          </div>
        ) : (
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-start">
              {STEPS.map((step, i) => {
                const isCompleted = i < currentStep;
                const isCurrent   = i === currentStep;
                const { Icon }    = step;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 relative">
                    {/* Left connector line */}
                    {i > 0 && (
                      <div
                        className={`absolute top-7 right-1/2 left-0 h-1.5 rounded-full ${
                          i <= currentStep ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    {/* Right connector line */}
                    {i < STEPS.length - 1 && (
                      <div
                        className={`absolute top-7 left-1/2 right-0 h-1.5 rounded-full ${
                          i < currentStep ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Circle */}
                    <div
                      className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 shadow-lg shadow-green-100'
                          : isCurrent
                          ? 'bg-red-500 border-red-500 shadow-lg shadow-red-100'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      ) : (
                        <Icon
                          className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-gray-300'}`}
                        />
                      )}
                    </div>

                    {/* Labels */}
                    <div className="text-center mt-3 px-1">
                      <p className={`text-xs font-semibold leading-tight ${
                        isCompleted ? 'text-green-600' :
                        isCurrent   ? 'text-red-600'   :
                                      'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 leading-tight ${
                        isCompleted || isCurrent ? 'text-gray-400' : 'text-gray-300'
                      }`}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancel action */}
        {order.trangThai === 'cho_xac_nhan' && (
          <div className="px-6 pb-5">
            {cancelError && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mb-2">
                <AlertTriangle className="w-3 h-3 shrink-0" />{cancelError}
              </p>
            )}
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-sm text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors font-medium"
              >
                Hủy đơn hàng
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl border border-red-100 p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-600 flex-1">Bạn có chắc muốn hủy đơn hàng này?</p>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Không
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2-column layout ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* LEFT: Products + Pricing */}
        <div className="lg:col-span-2 space-y-4">
          {/* Products list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Sản phẩm đặt mua</h2>
              <span className="text-xs text-gray-400">{order.items.length} sản phẩm</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map(item => (
                <div key={item._id} className="flex items-center gap-4 px-6 py-4">
                  {item.hinhAnh ? (
                    <img
                      src={item.hinhAnh}
                      alt={item.tenSanPham}
                      className="w-18 h-18 object-cover rounded-xl border border-gray-100 shrink-0"
                      style={{ width: 72, height: 72 }}
                    />
                  ) : (
                    <div className="w-18 h-18 bg-gray-100 rounded-xl flex items-center justify-center shrink-0" style={{ width: 72, height: 72 }}>
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.tenSanPham}</p>
                    {item.variant && (
                      <span className="inline-block mt-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {item.variant}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">Số lượng: {item.soLuong}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">{fmt(item.gia)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">x{item.soLuong}</p>
                    <p className="text-xs font-semibold text-red-500 mt-1">{fmt(item.gia * item.soLuong)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl space-y-2.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tạm tính ({order.items.reduce((s, i) => s + i.soLuong, 0)} sản phẩm)</span>
                <span>{fmt(order.tongTien)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Phí vận chuyển</span>
                <span className={order.phiGiaoHang === 0 ? 'text-green-600 font-semibold' : ''}>
                  {order.phiGiaoHang === 0 ? 'Miễn phí' : fmt(order.phiGiaoHang)}
                </span>
              </div>
              <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-1" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-gray-700">Tổng thanh toán</span>
                <span className="text-red-500 text-lg">{fmt(order.tongThanhToan)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Info sidebar */}
        <div className="space-y-4">
          {/* Shipping address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Địa chỉ giao hàng</h3>
            </div>
            <p className="text-sm font-semibold text-gray-800">{order.receiverName}</p>
            <p className="text-sm text-gray-500 mt-1">{order.phone}</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {order.detailAddress}, {order.ward}, {order.district}, {order.province}
            </p>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                order.paymentMethod === 'cod' ? 'bg-green-50' :
                order.paymentMethod === 'vnpay' ? 'bg-indigo-50' :
                order.paymentMethod === 'momo' ? 'bg-pink-50' : 'bg-blue-50'
              }`}>
                {order.paymentMethod === 'cod' ? <Banknote className="w-4 h-4 text-green-500" /> :
                 order.paymentMethod === 'vnpay' ? <CreditCard className="w-4 h-4 text-indigo-500" /> :
                 order.paymentMethod === 'momo' ? <Smartphone className="w-4 h-4 text-pink-500" /> :
                 <CreditCard className="w-4 h-4 text-blue-500" />}
              </div>
              <h3 className="text-sm font-bold text-gray-800">Thanh toán</h3>
            </div>
            <p className="text-sm text-gray-600">
              {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' :
               order.paymentMethod === 'vnpay' ? 'VNPay' :
               order.paymentMethod === 'momo' ? 'MoMo' :
               'Chuyển khoản ngân hàng'}
            </p>
            {order.paymentMethod === 'vnpay' && (
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : order.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                     order.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                     'Chưa thanh toán'}
                  </span>
                </div>
                {order.paymentInfo?.transactionNo && (
                  <div className="text-gray-500">
                    <span className="text-xs text-gray-400">Mã GD VNPay: </span>
                    <span className="font-mono font-medium">{order.paymentInfo.transactionNo}</span>
                  </div>
                )}
                {order.paymentInfo?.bankCode && (
                  <div className="text-gray-500">
                    <span className="text-xs text-gray-400">Ngân hàng: </span>
                    <span>{order.paymentInfo.bankCode}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {order.ghiChu && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Ghi chú</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{order.ghiChu}</p>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 pb-2">
        <Link
          href="/don-hang"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />Quay lại danh sách đơn hàng
        </Link>
      </div>
    </div>
  );
}
