"use client";

import { useState } from "react";
import {
  Search,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

interface Reply {
  replyText: string;
  repliedAt: string;
}

interface CustomerQuestion {
  _id: string;
  userName: string;
  isPurchased: boolean;
  questionText: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  reply?: Reply;
}

const INITIAL_CUSTOMER_QUESTIONS: CustomerQuestion[] = [
  {
    _id: "1",
    userName: "Tu Vi",
    isPurchased: true,
    questionText: "Viết khang có đẹp toai ko",
    createdAt: "24/06/2026",
    likes: 5,
    reply: {
      replyText: "ngoài hình trong bóng",
      repliedAt: "24/06/2026 14:20",
    },
  },
  {
    _id: "2",
    userName: "Tu Vi",
    isPurchased: false,
    questionText: "chao shop",
    createdAt: "24/06/2026",
    likes: 0,
    reply: { replyText: "hi bạn", repliedAt: "24/06/2026 14:10" },
  },
  {
    _id: "3",
    userName: "Nguyễn Văn Thắng",
    isPurchased: true,
    questionText: "Sản phẩm này có được tặng kèm bao da không ạ?",
    createdAt: "23/06/2026",
    likes: 12,
    reply: {
      replyText: "Dạ có kèm bao da chính hãng trong hộp bạn nhé!",
      repliedAt: "23/06/2026 16:00",
    },
  },
];

export default function ProductQuestionsCustomer() {
  const [questions, setQuestions] = useState<CustomerQuestion[]>(
    INITIAL_CUSTOMER_QUESTIONS,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(2);

  const formatAnonymizedName = (name: string) => {
    const words = name.split(" ");
    if (words.length === 1) return name;
    return `${words[0]} * ${words[words.length - 1]}`;
  };

  const handleLike = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._id === id) {
          const isLiked = !q.likedByMe;
          return {
            ...q,
            likedByMe: isLiked,
            likes: isLiked ? q.likes + 1 : q.likes - 1,
          };
        }
        return q;
      }),
    );
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.reply?.replyText &&
        q.reply.replyText.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const displayedQuestions = filteredQuestions.slice(0, visibleCount);

  return (
    /* THAY ĐỔI: max-w-3xl -> max-w-5xl giúp khung rộng hơn, p-6 -> p-8 tăng đệm lòng bên trong */
    <div className="max-w-7xl mx-auto p-10 bg-white rounded-2xl border border-gray-100 shadow-sm font-sans mt-6">
      {/* Tiêu đề vùng Hỏi & ĐÁP */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-red-600" size={22} />
        <h2 className="text-xl font-bold text-gray-800 m-0">
          Hỏi đáp về sản phẩm
        </h2>
      </div>

      {/* THANH TÌM KIẾM CÂU HỎI RỘNG RÃI */}
      <div className="relative mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm câu hỏi hoặc câu trả lời liên quan..."
          className="w-full text-base p-3.5 pl-11 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 transition-all"
        />
      </div>

      {/* Danh sách hiển thị hỏi đáp */}
      <div className="space-y-6">
        {displayedQuestions.map((q) => (
          <div
            key={q._id}
            className="border-b border-gray-100 pb-6 last:border-none last:pb-0"
          >
            {/* Khối thông tin khách hàng */}
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              <div className="w-7 h-7 rounded-full bg-rose-50 text-red-600 font-bold flex items-center justify-center text-sm">
                {q.userName.charAt(0)}
              </div>

              <span className="text-sm font-semibold text-gray-800">
                {formatAnonymizedName(q.userName)}
              </span>

              {q.isPurchased && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-md font-medium border border-emerald-100">
                  <CheckCircle2 size={12} /> Đã mua hàng tại SmartHub
                </span>
              )}

              <span className="text-xs text-gray-400">· {q.createdAt}</span>
            </div>

            {/* Nội dung câu hỏi - Tăng khoảng trống lùi đầu dòng để thẳng hàng với khối trả lời */}
            <p className="text-[15px] text-gray-700 pl-10 m-0 font-normal leading-relaxed">
              {q.questionText}
            </p>

            {/* Khối câu trả lời từ hệ thống / Admin */}
            {q.reply && (
              /* THAY ĐỔI: ml-8 -> ml-10 để căn chỉnh lề bên trái rộng và thoáng hơn */
              <div className="mt-4 ml-10 bg-gray-50/80 border border-gray-100 rounded-2xl p-5 relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-bold text-red-600">
                    SmartHub trả lời
                  </span>
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">
                    QTV
                  </span>
                </div>

                <p className="text-[14px] text-gray-600 m-0 leading-relaxed">
                  {q.reply.replyText}
                </p>

                {/* Nút hữu ích */}
                <div className="mt-4 flex items-center gap-4 border-t border-gray-200/50 pt-3">
                  <button
                    onClick={() => handleLike(q._id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer p-0 transition-colors ${
                      q.likedByMe
                        ? "text-red-600 font-semibold"
                        : "text-gray-400 hover:text-red-600"
                    }`}
                  >
                    <ThumbsUp
                      size={14}
                      className={q.likedByMe ? "fill-red-600/10" : ""}
                    />
                    {q.likedByMe
                      ? "Đã đánh giá hữu ích"
                      : "Câu trả lời hữu ích?"}
                    {q.likes > 0 && (
                      <span className="text-gray-500 font-normal">
                        ({q.likes})
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            Không tìm thấy câu hỏi nào trùng khớp với từ khóa của bạn.
          </div>
        )}
      </div>

      {/* Nút xem thêm câu hỏi */}
      {filteredQuestions.length > visibleCount && (
        <div className="mt-6 text-center border-t border-gray-100 pt-5">
          <button
            onClick={() => setVisibleCount((prev) => prev + 2)}
            className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-5 py-2.5 rounded-xl font-semibold cursor-pointer transition-colors"
          >
            Xem thêm câu hỏi khác <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
