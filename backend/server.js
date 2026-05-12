import "dotenv/config";
import app from "./src/app.js";
// import connectDB from "./src/config/db.js"; // Nếu bạn có file kết nối DB riêng

const port = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // await connectDB(); // Đảm bảo DB kết nối thành công trước khi chạy app
    app.listen(port, () => {
      console.log(`✅ Server is running on port: ${port}`);
    });
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error.message);
    process.exit(1);
  }
};

startServer();
