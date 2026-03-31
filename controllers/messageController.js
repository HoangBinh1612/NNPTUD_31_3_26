const Message = require('../schemas/Message');
const mongoose = require('mongoose');

// @route   POST /
// @desc    Gửi một tin nhắn mới (text hoặc file)
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { text, to } = req.body;
        const from = req.user.id; // Lấy từ authMiddleware
        
        if (!to) {
            return res.status(400).json({ error: 'Bắt buộc phải cung cấp "to" (ID người nhận)' });
        }

        let type = 'text';
        let messageText = text;

        // Nếu req có file gửi lên (do multer xử lý)
        if (req.file) {
            type = 'file';
            // Chuẩn hoá đường dẫn file cho an toàn
            messageText = req.file.path.replace(/\\/g, '/');
        }
        
        if (!messageText) {
             return res.status(400).json({ error: 'Nội dung text/file không được để trống' });
        }

        const newMessage = new Message({
            from,
            to,
            messageContent: {
                type,
                text: messageText
            }
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            data: newMessage,
            message: 'Gửi tin nhắn thành công'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// @route   GET /:userID
// @desc    Lấy toàn bộ lịch sử trò chuyện 1-1 giữa user hiện tại và userID
// @access  Private 
exports.getChatHistory = async (req, res) => {
    try {
        const currentUser = req.user.id;
        const otherUser = req.params.userID;

        // Tìm tất cả tin nhắn đáp ứng 1 trong 2 điều kiện: gửi từ tôi->bạn, hoặc từ bạn->tôi
        const messages = await Message.find({
            $or: [
                { from: currentUser, to: otherUser },
                { from: otherUser, to: currentUser }
            ]
        }).sort({ createdAt: 1 }); // Sắp xếp cũ -> mới

        res.status(200).json({
             success: true,
             count: messages.length,
             data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

// @route   GET /
// @desc    Lấy list tin nhắn gần nhất với từng User mình đã chat
// @access  Private
exports.getRecentConversations = async (req, res) => {
    try {
        const currentUser = new mongoose.Types.ObjectId(req.user.id);

        const recentChats = await Message.aggregate([
            // Lọc ra các tin nhắn có liên quan user hiện tại
            {
                $match: {
                    $or: [
                        { from: currentUser },
                        { to: currentUser }
                    ]
                }
            },
            // Tính toán người mà user hiện tại trò chuyện cùng trong tin nhắn đó (partner)
            {
                $addFields: {
                    partner: {
                        $cond: {
                            if: { $eq: ["$from", currentUser] },
                            then: "$to",
                            else: "$from"
                        }
                    }
                }
            },
            // Order từ mới nhất -> cũ nhất trước khi Filter
            {
                $sort: { createdAt: -1 }
            },
            // Group theo Partner và dùng $first lấy phần tử mới nhất (nhờ bước sort ở trên)
            {
                $group: {
                    _id: "$partner",
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            // Xóa trường partner dư thừa trong tin nhắn
            {
                $project: {
                    "lastMessage.partner": 0
                }
            },
            // Sắp xếp các đoạn hội thoại có tin nhắn mới nhất lên trên
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        res.status(200).json({
             success: true,
             count: recentChats.length,
             data: recentChats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};
