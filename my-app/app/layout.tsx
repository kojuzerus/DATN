import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DATN App",
  description: "Ứng dụng đồ án tốt nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">
        {/* Background ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-900/10 blur-[150px]" />
        </div>

        {/* Noise texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Header / Navbar */}
        <header className="relative z-50 w-full border-b border-white/5 backdrop-blur-xl bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-white/90 tracking-tight text-lg">
                DATN<span className="text-violet-400">.</span>
              </span>
            </a>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8">
              {["Trang chủ", "Sản phẩm", "Danh mục", "Về chúng tôi"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-violet-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="text-sm text-white/60 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                Đăng nhập
              </button>
              <button className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300">
                Đăng ký
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">D</span>
                  </div>
                  <span className="font-semibold text-white/90">DATN<span className="text-violet-400">.</span></span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Đồ án tốt nghiệp — Xây dựng ứng dụng web hiện đại với Next.js và MongoDB.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Điều hướng</h4>
                <ul className="space-y-2">
                  {["Trang chủ", "Sản phẩm", "Giỏ hàng", "Tài khoản"].map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Liên hệ</h4>
                <ul className="space-y-2 text-sm text-white/40">
                  <li>📧 datn@email.com</li>
                  <li>📱 0909 000 000</li>
                  <li>📍 TP. Hồ Chí Minh</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/25">© 2025 DATN. Đồ án tốt nghiệp.</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/25">Hệ thống hoạt động bình thường</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}