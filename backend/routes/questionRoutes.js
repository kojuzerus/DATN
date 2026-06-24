const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Định nghĩa Schema (Nếu bạn đã có file model riêng thì chỉ cần require vào)
const QuestionSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Tránh lỗi đè Model nếu hot-reload của Node.js chạy lại
const Question =
  mongoose.models.Question || mongoose.model("Question", QuestionSchema);

// 1. Endpoint xử lý hành động POST câu hỏi (Khách hàng gửi câu hỏi)
router.post("/", async (req, res) => {
  try {
    const { productId, name, question } = req.body;

    if (!productId || !name || !question.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin câu hỏi" });
    }

    const newQA = new Question({ productId, name, question });
    await newQA.save();

    return res.status(201).json(newQA);
  } catch (error) {
    console.error("Lỗi lưu database:", error);
    return res.status(500).json({ message: "Lỗi hệ thống server" });
  }
});

// 2. 🌟 BỔ SUNG: API lấy toàn bộ danh sách câu hỏi (Dành cho trang Admin quản lý)
router.get("/admin/all", async (req, res) => {
  try {
    // Sắp xếp theo thứ tự câu hỏi mới nhất lên đầu tiên
    const questions = await Question.find().sort({ createdAt: -1 });
    return res.status(200).json(questions);
  } catch (error) {
    console.error("Lỗi lấy danh sách câu hỏi admin:", error);
    return res.status(500).json({ message: "Lỗi hệ thống server" });
  }
});
// API: Lấy danh sách câu hỏi của một sản phẩm cụ thể (Dành cho giao diện khách hàng)
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    // Tìm tất cả câu hỏi thuộc sản phẩm này, sắp xếp cái mới nhất lên đầu
    const questions = await Question.find({ productId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(questions);
  } catch (error) {
    console.error("Lỗi lấy câu hỏi theo sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống server" });
  }
});
// 3. 🌟 BỔ SUNG: API cập nhật câu trả lời từ Admin gửi xuống
router.put("/admin/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res
        .status(400)
        .json({ message: "Nội dung câu trả lời không được để trống" });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { answer: answer.trim() },
      { new: true }, // Trả về dữ liệu mới ngay sau khi cập nhật thành công
    );

    if (!updatedQuestion) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy dữ liệu câu hỏi cần trả lời" });
    }

    return res.status(200).json({ success: true, data: updatedQuestion });
  } catch (error) {
    console.error("Lỗi cập nhật câu trả lời admin:", error);
    return res.status(500).json({ message: "Lỗi hệ thống server" });
  }
});

// 🌟 QUAN TRỌNG: Phải export router này ra
module.exports = router;
