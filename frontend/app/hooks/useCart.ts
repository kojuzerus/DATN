'use client';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useCart() {
  const [adding, setAdding] = useState(false);

  const addToCart = async (product: {
    productId: string;
    tenSanPham: string;
    hinhAnh?: string;
    gia: number;
    soLuong?: number;
    variant?: string;
  }) => {
    const token = localStorage.getItem('token') || localStorage.getItem('smarthub_token');
    
    console.log('=== ADD TO CART ===');
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'KHÔNG CÓ TOKEN');
    console.log('Product:', product);

    if (!token) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      window.location.href = '/dang-nhap';
      return false;
    }

    setAdding(true);
    try {
      const body = {
        productId:  product.productId,
        tenSanPham: product.tenSanPham,
        hinhAnh:    product.hinhAnh || '',
        gia:        product.gia,
        soLuong:    product.soLuong || 1,
        variant:    product.variant || '',
      };
      console.log('Gửi lên:', body);

      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('Response status:', res.status);
      console.log('Response data:', data);

      if (data.success) {
        window.dispatchEvent(new Event('cart-updated'));
        return true;
      } else {
        alert('Lỗi: ' + (data.message || 'Không rõ lỗi'));
        return false;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Không thể kết nối server!');
      return false;
    } finally {
      setAdding(false);
    }
  };

  return { addToCart, adding };
}
