"use client";

import { useEffect, useState } from "react";

/* ── Types ─────────────────────────────────────────────────────────────── */
export interface ComparisonItem {
  id: number;
  ten: string;
  slug: string;
  thumbnail: string;
  gia: number;
  giaSale: number | null;
  giamGia: number;
  danhGia: number;
  thuongHieu: string;
  categoryName: string;
}

const STORAGE_KEY = "smarthub_so_sanh";
const EVENT_NAME = "comparison-updated";
const MAX_ITEMS = 3;

function docDanhSach(): ComparisonItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function luuVaBao(items: ComparisonItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
}

/* ── Hook so sánh sản phẩm ─────────────────────────────────────────────────
   Không dùng React Context/Provider — đồng bộ qua localStorage + custom
   event, giống cách useCart() đang dùng event "cart-updated". Nhờ vậy
   không cần bọc <ComparisonProvider> ở layout, gọi useComparison() ở bất
   kỳ component nào cũng dùng được ngay.
──────────────────────────────────────────────────────────────────────────── */
export function useComparison() {
  const [items, setItems] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    setItems(docDanhSach());
    const onUpdate = () => setItems(docDanhSach());
    window.addEventListener(EVENT_NAME, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const addItem = (item: ComparisonItem) => {
    const current = docDanhSach();
    if (current.some((p) => p.id === item.id)) return;
    if (current.length >= MAX_ITEMS) {
      alert(`Chỉ có thể so sánh tối đa ${MAX_ITEMS} sản phẩm.`);
      return;
    }
    const next = [...current, item];
    luuVaBao(next);
    setItems(next);
  };

  const removeItem = (id: number) => {
    const next = docDanhSach().filter((p) => p.id !== id);
    luuVaBao(next);
    setItems(next);
  };

  const isInComparison = (id: number) => items.some((p) => p.id === id);

  const clearItems = () => {
    luuVaBao([]);
    setItems([]);
  };

  return { items, addItem, removeItem, isInComparison, clearItems };
}
