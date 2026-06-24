'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Search, Check, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useComparison } from './comparisonContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

interface Product {
  id: number;
  ten: string;
  slug: string;
  thuongHieu: string;
  thumbnail: string;
  gia: number;
  giaSale: number | null;
  giamGia: number;
  danhGia: number;
  luotBan: number;
  badge: string;
  categoryName: string;
}

export default function ComparisonModal() {
  const {
    items, addItem, removeItem, isInComparison,
    modalOpen, modalCategoryName, closeModal,
  } = useComparison();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!modalOpen || !modalCategoryName) return;
    setLoading(true);
    setSearch('');
    fetch(`${API_BASE}/api/products?category_name=${encodeURIComponent(modalCategoryName)}&limit=50&sort=sold`)
      .then(r => r.json())
      .then(data => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    setTimeout(() => searchRef.current?.focus(), 150);
  }, [modalOpen, modalCategoryName]);

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalOpen, closeModal]);

  const filtered = products.filter(p =>
    p.ten.toLowerCase().includes(search.toLowerCase()) ||
    p.thuongHieu.toLowerCase().includes(search.toLowerCase())
  );

  const handleChoose = (p: Product) => {
    if (isInComparison(p.id)) {
      removeItem(p.id);
    } else {
      addItem({
        id: p.id, ten: p.ten, slug: p.slug, thumbnail: p.thumbnail,
        gia: p.gia, giaSale: p.giaSale, giamGia: p.giamGia,
        danhGia: p.danhGia, thuongHieu: p.thuongHieu, categoryName: p.categoryName,
      });
    }
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-[15px]">Chọn sản phẩm so sánh</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Danh mục:&nbsp;
              <span className="text-red-500 font-semibold">{modalCategoryName}</span>
            </p>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200 focus-within:border-red-400 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm sản phẩm muốn so sánh..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col p-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="w-16 h-8 bg-gray-100 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(p => {
                const inCompare = isInComparison(p.id);
                const isFull = !inCompare && items.length >= 3;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3.5 px-5 py-3 transition-colors ${
                      inCompare ? 'bg-red-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={p.thumbnail || 'https://placehold.co/56x56?text=?'}
                      alt={p.ten}
                      className="w-14 h-14 object-contain rounded-xl border border-gray-100 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{p.thuongHieu}</p>
                      <p className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2">{p.ten}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[13px] font-bold text-gray-900">{fmt(p.giaSale ?? p.gia)}</span>
                        {p.giamGia > 0 && (
                          <span className="text-xs text-gray-400 line-through">{fmt(p.gia)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => !isFull && handleChoose(p)}
                      disabled={isFull}
                      className={`shrink-0 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all border ${
                        inCompare
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : isFull
                          ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-red-600 border-red-200 hover:bg-red-50 cursor-pointer'
                      }`}
                    >
                      {inCompare
                        ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" />Đã chọn</span>
                        : 'Chọn'
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/60 shrink-0">
          <div className="flex items-center gap-3">
            {/* Selected chips */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 bg-white border border-red-100 rounded-xl px-2 py-1.5 shrink-0"
                >
                  <img
                    src={item.thumbnail || 'https://placehold.co/24x24?text=?'}
                    alt={item.ten}
                    className="w-6 h-6 object-contain shrink-0"
                  />
                  <span className="text-[11px] text-gray-700 max-w-[90px] truncate">{item.ten}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white border border-dashed border-gray-300 rounded-xl px-3 py-1.5 shrink-0"
                >
                  <Plus className="w-3 h-3 text-gray-300" />
                  <span className="text-[11px] text-gray-400">Chọn sản phẩm</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-gray-500 hidden sm:block">
                Đã chọn {items.length} sản phẩm
              </span>
              <Link
                href="/sosanh"
                onClick={closeModal}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                  items.length >= 2
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-200 text-gray-400 pointer-events-none'
                }`}
              >
                So sánh
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
