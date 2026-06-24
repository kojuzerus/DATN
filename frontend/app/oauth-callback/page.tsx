"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // 1. Lấy token trực tiếp từ URL query params khi redirect về
      const tokenFromUrl = searchParams.get("token");

      if (tokenFromUrl) {
        // Nếu có token mới trên URL, lưu ngay vào localStorage
        localStorage.setItem("smarthub_token", tokenFromUrl);
      }

      // 2. Lấy token ra để chuẩn bị gọi API kiểm tra
      const token = tokenFromUrl || localStorage.getItem("smarthub_token");

      if (!token) {
        console.error("Không tìm thấy token!");
        // Nếu không có token, chuyển hướng người dùng về trang login sau 2 giây
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/userinfo", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          console.log("Xác thực thành công, dữ liệu user:", data);

          // TODO: Lưu data.user vào Context / Redux / Zustand của bạn tại đây
          // ví dụ: loginSuccess(data.user);

          // Chuyển hướng người dùng về trang chủ sau khi đăng nhập thành công
          router.push("/");
        } else {
          console.error("Lỗi xác thực từ backend:", data.message);
          // Token lỗi/hết hạn thì xóa đi và đá về login
          localStorage.removeItem("smarthub_token");
          setTimeout(() => router.push("/login"), 2000);
        }
      } catch (err) {
        console.error("Lỗi khi kết nối API:", err);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F6]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-pink-100">
        <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium text-sm">
          Đang xử lý đăng nhập hệ thống...
        </p>
      </div>
    </div>
  );
}
