const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const upload = require('../utils/uploadMiddleware');
const mockAuth = require('../utils/authMiddleware');

// Áp dụng middleware giả lập user hiện tại trên tất cả các route nhắn tin
router.use(mockAuth);

// @route   POST /
// @desc    Post tin nhắn văn bản / đính kèm file
// Cấu hình multer field 'file' - tương ứng với key gửi lên trong Postman là "file"
router.post('/', upload.single('file'), messageController.sendMessage);

// @route   GET /
// @desc    Lấy tin nhắn cuối cùng với từng user đã từng liên hệ
// Lưu ý: Route "/" được viết trước route "/:userID" để tránh nhầm parameter 
// (Express hiểu "/" là path route "/" còn "/:userID" có dynamic param)
router.get('/', messageController.getRecentConversations);

// @route   GET /:userID
// @desc    Lấy toàn bộ tin nhắn 1-1
router.get('/:userID', messageController.getChatHistory);

module.exports = router;
