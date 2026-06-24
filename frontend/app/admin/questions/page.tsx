"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
} from "lucide-react";

// Giả định dữ liệu câu hỏi từ MongoDB truyền về FrontEnd
interface Question {
  _id: string;
  productId: string;
  productName: string;
  userName: string;
  questionText: string;
  isReplied: boolean;
  reply?: {
    replyText: string;
    repliedAt: string;
  };
}

const INITIAL_QUESTIONS: Question[] = [
  {
    _id: "1",
    productId: "iphone-15-pro-max",
    productName: "iPhone 15 Pro Max 256GB",
    userName: "Tu Vi",
    questionText: "Viết khang có đẹp toai ko",
    isReplied: true,
    reply: {
      replyText: "ngoài hình trong bóng",
      repliedAt: "24/06/2026 14:20",
    },
  },
  {
    _id: "2",
    productId: "256GB",
    productName: "iPad Air M2 256GB",
    userName: "Tu Vi",
    questionText: "ddd",
    isReplied: true,
    reply: { replyText: "hihi", repliedAt: "24/06/2026 14:15" },
  },
  {
    _id: "3",
    productId: "iphone-16-pro",
    productName: "iPhone 16 Pro",
    userName: "Nguyễn Văn Thắng",
    questionText: "Sản phẩm này còn màu hồng pastel không shop?",
    isReplied: false,
  },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "replied">(
    "all",
  );

  // State phục vụ việc chỉnh sửa câu trả lời nhanh
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  // 1. Logic Bộ lọc (Tabs)
  const filteredQuestions = questions.filter((q) => {
    if (activeTab === "pending") return !q.isReplied;
    if (activeTab === "replied") return q.isReplied;
    return true;
  });

  const countPending = questions.filter((q) => !q.isReplied).length;
  const countReplied = questions.filter((q) => q.isReplied).length;

  // 2. Hàm Xóa Bình luận / Câu hỏi
  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
      // Gọi API DELETE tới backend ở đây: await fetch(`/api/questions/${id}`, { method: 'DELETE' })
      setQuestions(questions.filter((q) => q._id !== id));
    }
  };

  // 3. Hàm kích hoạt chế độ Sửa câu trả lời
  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  // 4. Hàm Lưu câu trả lời sau khi sửa
  const handleSaveReply = (id: string) => {
    // Gọi API PUT/PATCH để cập nhật backend ở đây
    setQuestions(
      questions.map((q) => {
        if (q._id === id) {
          return {
            ...q,
            isReplied: editText.trim() !== "",
            reply:
              editText.trim() !== ""
                ? { replyText: editText, repliedAt: "Vừa xong" }
                : undefined,
          };
        }
        return q;
      }),
    );
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {/* Tiêu đề */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-red-600" /> Quản lý hỏi đáp & bình luận
        </h1>
        <p className="text-sm text-gray-400 mt-1">Trang chủ / Bình luận</p>
      </div>

      {/* ── 1. THANH BỘ LỌC TABS ── */}
      <div className="flex gap-2 border-b border-gray-100 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm rounded-xl cursor-pointer font-medium transition-all ${
            activeTab === "all"
              ? "bg-red-50 text-red-600 font-semibold"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Tất cả ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm rounded-xl cursor-pointer font-medium transition-all ${
            activeTab === "pending"
              ? "bg-amber-50 text-amber-600 font-semibold"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Chờ trả lời ({countPending})
        </button>
        <button
          onClick={() => setActiveTab("replied")}
          className={`px-4 py-2 text-sm rounded-xl cursor-pointer font-medium transition-all ${
            activeTab === "replied"
              ? "bg-emerald-50 text-emerald-600 font-semibold"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Đã trả lời ({countReplied})
        </button>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div
            key={q._id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative group"
          >
            {/* Các nút hành động Xóa / Sửa ở góc phải */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDelete(q._id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer"
                title="Xóa bình luận"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Thông tin User & Link sản phẩm */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-red-600 font-bold flex items-center justify-center text-sm">
                  {q.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 m-0">
                    {q.userName}
                  </h3>
                  {/* ── 3. LINK LIÊN KẾT SẢN PHẨM ── */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">Sản phẩm:</span>
                    <Link
                      href={`/products/${q.productId}`}
                      target="_blank"
                      className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {q.productName || q.productId} <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Trạng thái hiển thị */}
              {q.isReplied ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle size={12} /> Đã phản hồi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                  <Clock size={12} /> Chờ trả lời
                </span>
              )}
            </div>

            {/* Nội dung câu hỏi */}
            <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-700 mb-3 border border-gray-100">
              <span className="font-semibold text-gray-500 mr-1">Hỏi:</span>{" "}
              {q.questionText}
            </div>

            {/* ── 2 & 4. PHẦN TRẢ LỜI / SỬA TRẢ LỜI ── */}
            {editingId === q._id ? (
              // Chế độ đang SỬA/THÊM câu trả lời
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 resize-none font-sans"
                  rows={2}
                  placeholder="Nhập nội dung phản hồi khách hàng..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 border-none rounded-lg cursor-pointer font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSaveReply(q._id)}
                    className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 border-none rounded-lg cursor-pointer font-medium"
                  >
                    Lưu câu trả lời
                  </button>
                </div>
              </div>
            ) : // Chế độ HIỂN THỊ câu trả lời thông thường
            q.isReplied && q.reply ? (
              <div className="bg-rose-50/40 rounded-xl p-3.5 text-sm text-gray-700 border border-rose-100/60 flex items-start justify-between group/reply">
                <div>
                  <span className="font-bold text-red-600 mr-1">
                    SmartHub trả lời:
                  </span>
                  <span>{q.reply.replyText}</span>
                  <span className="block text-[10px] text-gray-400 mt-1.5 tracking-tight">
                    Phản hồi lúc: {q.reply.repliedAt}
                  </span>
                </div>
                {/* Nút sửa nhanh */}
                <button
                  onClick={() => startEdit(q._id, q.reply!.replyText)}
                  className="p-1 text-gray-400 hover:text-blue-600 border-none bg-transparent cursor-pointer opacity-0 group-hover/reply:opacity-100 transition-opacity"
                  title="Sửa câu trả lời"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            ) : (
              // Nếu chưa trả lời, hiện nút để bấm trả lời nhanh luôn
              <button
                onClick={() => startEdit(q._id, "")}
                className="text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                Viết câu trả lời ngay
              </button>
            )}
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Không tìm thấy bình luận nào trong mục này.
          </div>
        )}
      </div>
    </div>
  );
}
