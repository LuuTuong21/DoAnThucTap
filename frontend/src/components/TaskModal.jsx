import React, { useState } from 'react';

function TaskModal({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    const newErrors = {};

    // Logic Validation 1: Check rỗng cho Tiêu đề
    if (!title.trim()) {
      newErrors.title = "Tiêu đề công việc không được để trống.";
    }

    // Logic Validation 2: Check rỗng VÀ check quá khứ cho Hạn chót
    if (!deadline) {
      // Báo lỗi nếu người dùng bỏ trống
      newErrors.deadline = "Chưa thêm thời gian.";
    } else {
      const selectedDate = new Date(deadline);
      const currentDate = new Date();
      
      // Nếu có thời gian nhưng lại nằm trong quá khứ -> Báo lỗi
      if (selectedDate < currentDate) {
        newErrors.deadline = "Hạn chót không được nằm trong quá khứ.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); 
      return; 
    }

    const newTask = {
      task_id: Math.floor(Math.random() * 10000), 
      title: title,
      description: description,
      deadline: deadline // Bây giờ chắc chắn đã có dữ liệu nên không cần || nữa
    };

    onAddTask(newTask);

    setTitle('');
    setDescription('');
    setDeadline('');
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleUp_0.2s_ease-out]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Thêm công việc mới
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: ''});
              }} 
              placeholder="Vd: Thiết kế Database..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-shadow ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
            {/* Thêm dấu * đỏ để báo hiệu đây là trường bắt buộc */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hạn chót <span className="text-red-500">*</span>
            </label>
            <input 
              type="datetime-local" 
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                if (errors.deadline) setErrors({...errors, deadline: ''});
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-shadow ${
                errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-emerald-500/30 transition-all duration-300"
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