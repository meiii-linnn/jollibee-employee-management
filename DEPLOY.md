# Deploy Jollibee Employee Management lên Render

## 3 bước nhanh:

### 1. Push code lên GitHub
```bash
cd jollibee-employee-management
git init
git add .
git commit -m "Prepare for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/jollibee-employee-management.git
git push -u origin master
```

### 2. Deploy lên Render
1. Vào https://render.com → Đăng ký bằng GitHub
2. Click "New +" → "Web Service"
3. Connect repository `jollibee-employee-management`
4. Render sẽ tự động phát hiện Dockerfile
5. Click "Deploy Web Service"
6. Render sẽ tự động tạo PostgreSQL database

### 3. Seed Database
Sau khi deploy xong (khoảng 10-15 phút):
1. Vào Web Service trên Render
2. Click "Shell" tab
3. Chạy: `python seed.py`

## Truy cập ứng dụng
- URL: `https://jollibee-employee-management.onrender.com` (hoặc URL mà Render cung cấp)
- Username: `admin`
- Password: `admin123`

## Lưu ý
- Deploy lần đầu khoảng 10-15 phút (build React + cài dependencies)
- Các lần deploy sau sẽ nhanh hơn (khoảng 2-3 phút)
- App sẽ tự động restart sau mỗi lần push code mới

## Xóa sau 1 tháng
1. Render Dashboard → Web Service → Settings → Delete Web Service
2. Render Dashboard → PostgreSQL → Settings → Delete Database
