import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // State cho Modal Đổi mật khẩu
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Thông báo phản hồi
  const [message, setMessage] = useState({ type: '', text: '' });
  const [modalError, setModalError] = useState('');

  // Tải thông tin người dùng
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get('https://kaban-api-backend-ro81.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.user) {
          setName(res.data.user.name || '');
          setEmail(res.data.user.email || '');
        }
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin người dùng:", err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Xử lý Cập nhật tên
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Tên hiển thị không được để trống!' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('https://kaban-api-backend-ro81.onrender.com/api/auth/profile', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Cập nhật tên thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật tên thất bại!' });
    }
  };

  // Xử lý Đổi mật khẩu trong Modal
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');

    if (newPassword.length < 6) {
      setModalError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('https://kaban-api-backend-ro81.onrender.com/api/auth/change-password', {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl self-start">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">⚙️ Cài đặt tài khoản</h1>

        {/* Thông báo chung */}
        {message.text && (
          <div className={`p-3 rounded-lg text-sm mb-4 font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Form Đổi tên */}
        <form onSubmit={handleUpdateName} className="flex flex-col gap-4 mb-8">
          <h2 className="text-base font-semibold text-gray-700">Thông tin cá nhân</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email (Không thể thay đổi)</label>
            <input 
              type="email" 
              disabled 
              value={email} 
              className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-lg text-sm text-gray-500 cursor-not-allowed" 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nhập tên mới..." 
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
              />
              <button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm text-sm shrink-0 transition-all cursor-pointer"
              >
                Lưu tên
              </button>
            </div>
          </div>
        </form>

        <hr className="mb-6 border-gray-100" />

        {/* Nút mở Modal Đổi Mật Khẩu */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Mật khẩu</h3>
            <p className="text-xs text-gray-500">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
          </div>
          <button 
            type="button" 
            onClick={() => {
              setIsPasswordModalOpen(true);
              setModalError('');
              setNewPassword('');
              setConfirmPassword('');
            }}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* Modal Đổi Mật Khẩu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Đổi mật khẩu
            </h2>

            {modalError && (
              <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs mb-3 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu mới..." 
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Nhập lại mật khẩu mới..." 
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-emerald-500/20 text-sm transition-all cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;