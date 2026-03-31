// Middleware giả lập quá trình xác thực
// Dành cho việc test trên Postman dễ dàng
const mockAuth = (req, res, next) => {
    // Để mock user hiện tại, bạn có thể truyền ID qua Header: 'x-user-id'
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return res.status(401).json({ message: "Vui lòng cung cấp x-user-id trong mục Headers của Postman để đóng vai trò 'user hiện tại'" });
    }
    
    // Giả lập gán user vào request
    req.user = { id: userId };
    next();
};

module.exports = mockAuth;
