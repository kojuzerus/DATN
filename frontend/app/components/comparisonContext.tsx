'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface ComparisonProduct {
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

export type AddResult = 'ok' | 'max' | 'duplicate' | 'category_mismatch';

interface ComparisonContextType {
  items: ComparisonProduct[];
  addItem: (p: ComparisonProduct) => AddResult;
  removeItem: (id: number) => void;
  clearItems: () => void;
  isInComparison: (id: number) => boolean;
  modalOpen: boolean;
  modalCategoryName: string;
  openModal: (categoryName: string) => void;
  closeModal: () => void;
}

const ComparisonContext = createContext<ComparisonContextType>({
  items: [],
  addItem: () => 'ok',
  removeItem: () => {},
  clearItems: () => {},
  isInComparison: () => false,
  modalOpen: false,
  modalCategoryName: '',
  openModal: () => {},
  closeModal: () => {},
});

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ComparisonProduct[]>([]);
  const itemsRef = useRef<ComparisonProduct[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategoryName, setModalCategoryName] = useState('');

  // Keep ref in sync with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Load from localStorage and validate same-category invariant
  useEffect(() => {
    try {
      const stored = localStorage.getItem('smarthub_compare');
      if (!stored) return;
      const parsed: ComparisonProduct[] = JSON.parse(stored);
      const allSameCategory =
        parsed.length === 0 ||
        parsed.every(p => p.categoryName === parsed[0].categoryName);
      if (!allSameCategory) {
        localStorage.removeItem('smarthub_compare');
        return;
      }
      setItems(parsed);
      itemsRef.current = parsed;
    } catch {
      localStorage.removeItem('smarthub_compare');
    }
  }, []);

  const addItem = (p: ComparisonProduct): AddResult => {
    const prev = itemsRef.current;
    if (prev.some(x => x.id === p.id)) return 'duplicate';
    if (prev.length >= 3) return 'max';
    if (prev.length > 0 && prev[0].categoryName !== p.categoryName) return 'category_mismatch';
    const next = [...prev, p];
    itemsRef.current = next;
    setItems(next);
    localStorage.setItem('smarthub_compare', JSON.stringify(next));
    return 'ok';
  };

  const removeItem = (id: number) => {
    const next = itemsRef.current.filter(x => x.id !== id);
    itemsRef.current = next;
    setItems(next);
    localStorage.setItem('smarthub_compare', JSON.stringify(next));
  };

  const clearItems = () => {
    itemsRef.current = [];
    setItems([]);
    localStorage.removeItem('smarthub_compare');
  };

  const isInComparison = (id: number) => itemsRef.current.some(x => x.id === id);

  const openModal = (categoryName: string) => {
    setModalCategoryName(categoryName);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <ComparisonContext.Provider value={{
      items, addItem, removeItem, clearItems, isInComparison,
      modalOpen, modalCategoryName, openModal, closeModal,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  return useContext(ComparisonContext);
}
