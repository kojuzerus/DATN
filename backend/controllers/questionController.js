const Question = require("../models/Question");
const User = require("../models/User");

exports.createQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    const newQuestion = await Question.create({
      productId,
      userId: user._id,
      name: user.hoTen,
      question,
    });

    res.status(201).json(newQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { productId } = req.params;

    const questions = await Question.find({
      productId,
    }).sort({
      createdAt: -1,
    });

    res.json(questions);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        answer,
        answeredBy: "SmartHub",
      },
      {
        new: true,
      },
    );

    res.json(question);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};
