import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Danh sách các menu chức năng
  const menuItems = [
    { name: 'Tổng quan (Dashboard)', path: '/' },
    { name: 'Quản lý Dự án (Projects)', path: '/projects' },
    { name: 'Cài đặt tài khoản', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Đã đăng xuất!");
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* CỘT TRÁI: THANH MENU (SIDEBAR) */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-600 uppercase tracking-wider">
            Kanban Pro
          </h1>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-500'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Nút Đăng xuất đưa xuống cuối menu */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG THAY ĐỔI THEO MENU */}
      <div className="flex-1 overflow-y-auto">
        {/* 'children' chính là Bảng Kanban hoặc các trang khác sẽ được nhúng vào đây */}
        {children}
      </div>

    </div>
  );
}

export default Layout;