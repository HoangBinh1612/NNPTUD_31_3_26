const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const path = require('path');

// Tải biến môi trường
require('dotenv').config();

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Dán nội dung ra dạng JSON (đối với application/json body)
// Nếu dùng form-data (bắt buộc khi gửi file cho multer)
app.use(express.urlencoded({ extended: true }));

// Để công khai folder uploads (nếu Postman hoặc ứng dụng Frontend cần lấy URL ảnh/file)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Mọi route liên quan tin nhắn sẽ có prefix là /api/messages
// Do đề bài là "viết 3 router sau get/:userId, post/, get/", ta sẽ map chúng vào đúng root này
// Endpoint thực tế sẽ là: GET /api/messages/:userID, POST /api/messages/, GET /api/messages/
app.use('/api/messages', require('./routes/messageRoutes'));

// Route demo
app.get('/', (req, res) => {
    res.send('API Đang chạy.. Chào mừng bạn test ứng dụng');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
