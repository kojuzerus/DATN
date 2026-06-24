'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  CheckCircle2, XCircle, Loader2, ShoppingBag, ClipboardList, Hash,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function VnpayReturnContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [transactionNo, setTransactionNo] = useState('');

  useEffect(() => {
    const success = params.get('success');
    const orderIdParam = params.get('orderId');
    const transactionNoParam = params.get('transactionNo');
    const messageParam = params.get('message');

    if (orderIdParam) setOrderId(orderIdParam);
    if (transactionNoParam) setTransactionNo(transactionNoParam);

    if (success === 'true') {
      setStatus('success');
      setMessage('Thanh toán VNPay thành công!');
    } else {
      setStatus('failed');
      setMessage(messageParam || 'Thanh toán VNPay thất bại hoặc bị hủy');
    }
  }, [params]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-red-500" />
          <p className="text-sm text-gray-400">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-11 h-11 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Giao dịch VNPay đã được xử lý thành công. Đơn hàng của bạn sẽ được xử lý sớm nhất.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-11 h-11 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
          </>
        )}

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Mã đơn hàng</p>
                <p className="font-mono font-bold text-gray-700 text-sm truncate">{orderId}</p>
              </div>
            </div>
            {transactionNo && (
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Mã giao dịch VNPay</p>
                  <p className="font-mono font-bold text-gray-700 text-sm truncate">{transactionNo}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/don-hang"
            className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
          >
            <ClipboardList className="w-4 h-4" />
            Xem đơn hàng của tôi
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense>
      <VnpayReturnContent />
    </Suspense>
  );
}
