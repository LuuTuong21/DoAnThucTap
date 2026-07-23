import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('https://kaban-api-backend-ro81.onrender.com/api/admin/users', getAuthConfig());
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lấy danh sách tài khoản!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`https://kaban-api-backend-ro81.onrender.com/api/admin/users/${editingId}`, formData, getAuthConfig());
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await axios.post('https://kaban-api-backend-ro81.onrender.com/api/admin/users', formData, getAuthConfig());
        toast.success("Thêm tài khoản thành công!");
      }
      handleCancelEdit();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await axios.delete(`https://kaban-api-backend-ro81.onrender.com/api/admin/users/${id}`, getAuthConfig());
      toast.success("Đã xóa tài khoản!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa thất bại!");
    }
  };

  // KHI BẤM SỬA: TỰ ĐỘNG CUỘN LÊN FORM & ĐIỀN DỮ LIỆU
  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ 
      name: user.name || '', 
      email: user.email || '', 
      password: '', 
      role: user.role || 'user' 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'user' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-extrabold text-emerald-700 mb-6 uppercase tracking-wider">
        🛡️ Quản lý tài khoản người dùng
      </h1>

      {/* Form Thêm/Sửa */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-emerald-200">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">
            {editingId ? `📝 Đang chỉnh sửa tài khoản #${editingId}` : "➕ Thêm tài khoản mới"}
          </h2>
          {editingId && (
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
              Chế độ chỉnh sửa
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên <span className="text-red-500">*</span></label>
            <input 
              type="text" required value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nhập tên..."
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
            <input 
              type="email" required value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Nhập email..."
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Mật khẩu {editingId ? "(Bỏ trống nếu không đổi)" : <span className="text-red-500">*</span>}
            </label>
            <input 
              type="password" 
              required={!editingId} 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder={editingId ? "Nhập mật khẩu mới nếu muốn đổi..." : "Nhập mật khẩu..."}
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Vai trò hệ thống</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 outline-none cursor-pointer bg-white"
            >
              <option value="user">User (Người dùng thường)</option>
              <option value="admin">Admin (Quản trị viên)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer">
            {editingId ? "Lưu cập nhật" : "Tạo tài khoản mới"}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm cursor-pointer"
            >
              Hủy bỏ
            </button>
          )}
        </div>
      </form>

      {/* Bảng danh sách User */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải danh sách người dùng...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-3">ID</th>
                <th className="p-3">Họ tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50 ${editingId === u.id ? 'bg-emerald-50/60' : ''}`}>
                  <td className="p-3 text-gray-500 font-mono">#{u.id}</td>
                  <td className="p-3 font-semibold text-gray-800">{u.name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      u.role?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <button 
                      onClick={() => handleEdit(u)} 
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors"
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;