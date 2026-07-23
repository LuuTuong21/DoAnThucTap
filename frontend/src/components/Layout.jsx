import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Layout({ children }) {
  // State để quản lý trạng thái đóng/mở của thanh menu
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Hàm giải mã JWT token để kiểm tra role (nếu có)
  const getUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.role;
    } catch (e) {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAdmin = userRole?.toLowerCase() === 'admin';

  // Danh sách các menu chức năng
  const allMenuItems = [
    { 
      name: 'Quản lý ST (Self Tasks)', 
      path: '/',
      icon: (
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      name: 'Quản lý Dự án (Projects)', 
      path: '/projects',
      icon: (
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Cài đặt tài khoản', 
      path: '/settings',
      icon: (
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Quản lý tài khoản', 
      path: '/admin/users',
      isAdminOnly: true,
      icon: (
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
  ];

  // Lọc hiển thị menu (Admin sẽ thấy đầy đủ, User thường sẽ ẩn mục Admin nếu đã phân quyền trong token)
  const menuItems = allMenuItems.filter(item => !item.isAdminOnly || isAdmin || userRole === null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Đã đăng xuất!");
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* CỘT TRÁI: THANH MENU (SIDEBAR) */}
      <div 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out z-20`}
      >
        {/* Header chứa Tên App và Nút thu gọn */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
          <h1 className={`text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-600 uppercase tracking-wider truncate transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'
          }`}>
            Kanban
          </h1>
          
          {/* Nút Toggle Menu */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors focus:outline-none mx-auto cursor-pointer"
            title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Danh sách Menu */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/tasks');
            return (
              <Link 
                key={item.name} 
                to={item.path}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-500'
                }`}
              >
                {item.icon}
                <span className={`whitespace-nowrap transition-opacity duration-300 ${
                  isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Nút Đăng xuất */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            title={isCollapsed ? "Đăng xuất" : ""}
            className={`flex items-center gap-4 w-full px-3 py-3 rounded-md font-medium transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
            }`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`whitespace-nowrap transition-opacity duration-300 ${
              isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'
            }`}>
              Đăng Xuất
            </span>
          </button>
        </div>
      </div>

      {/* CỘT PHẢI: NỘI DUNG THAY ĐỔI THEO MENU */}
      <div className="flex-1 h-screen overflow-y-auto relative">
        {/* 'children' chính là Bảng Kanban hoặc các trang khác sẽ được nhúng vào đây */}
        {children}
      </div>

    </div>
  );
}

export default Layout;