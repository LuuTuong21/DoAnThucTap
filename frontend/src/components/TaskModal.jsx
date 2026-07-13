import React, { useState } from 'react';

// Thêm prop onAddTask để truyền dữ liệu ngược lên App.jsx
function TaskModal({ isOpen, onClose, onAddTask }) {
  // Tạo state để lưu trữ giá trị của các ô input
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  // Hàm xử lý khi người dùng bấm nút "Lưu công việc"
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi load lại trang mặc định của form
    
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề công việc!");
      return;
    }

    // Đóng gói dữ liệu thành một object chuẩn
    const newTask = {
      task_id: Math.floor(Math.random() * 10000), // Random tạm 1 ID tĩnh
      title: title,
      description: description,
      deadline: deadline || "Chưa có hạn"
    };

    // Truyền gói dữ liệu này ra ngoài cho App.jsx xử lý
    onAddTask(newTask);

    // Xóa trắng form và đóng Modal
    setTitle('');
    setDescription('');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleUp_0.2s_ease-out]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Thêm công việc mới
        </h2>
        
        {/* Lắng nghe sự kiện onSubmit của Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề công việc <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)} // Cập nhật state liên tục khi gõ
              placeholder="Vd: Thiết kế Database..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chi tiết công việc cần làm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
            <input 
              type="datetime-local" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" // Đổi type thành submit để kích hoạt hàm handleSubmit
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-sm"
            >
              Lưu công việc
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default TaskModal;