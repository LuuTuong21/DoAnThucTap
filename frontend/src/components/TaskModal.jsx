import React, { useState, useEffect } from 'react';

function TaskModal({ isOpen, onClose, onAddTask, taskToEdit = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  
  const [errors, setErrors] = useState({});

  // Cập nhật/Reset form mỗi khi Modal mở/đóng hoặc thay đổi taskToEdit
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        // Chế độ CHỈNH SỬA: Điền sẵn thông tin công việc hiện tại
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority || 'Medium');
        setStatus(taskToEdit.status || 'To Do');

        if (taskToEdit.deadline) {
          // Format deadline chuẩn múi giờ địa phương cho datetime-local (YYYY-MM-THH:mm)
          const d = new Date(taskToEdit.deadline);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setDeadline(localISOTime);
        } else {
          setDeadline('');
        }
      } else {
        // Chế độ TẠO MỚI: Reset trắng các ô nhập
        setTitle('');
        setDescription('');
        setDeadline('');
        setPriority('Medium');
        setStatus('To Do');
      }
      setErrors({});
    }
  }, [isOpen, taskToEdit]);

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
      newErrors.deadline = "Chưa thêm thời gian.";
    } else {
      const selectedDate = new Date(deadline);
      const currentDate = new Date();
      
      // Nếu là tạo mới và chọn thời gian trong quá khứ -> Báo lỗi
      if (!taskToEdit && selectedDate < currentDate) {
        newErrors.deadline = "Hạn chót không được nằm trong quá khứ.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); 
      return; 
    }

    // Đóng gói dữ liệu công việc
    const taskPayload = {
      ...(taskToEdit && { task_id: taskToEdit.task_id }),
      title: title.trim(),
      description: description.trim(),
      deadline: deadline,
      priority: priority,
      status: status
    };

    onAddTask(taskPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleUp_0.2s_ease-out]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          {taskToEdit ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
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
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white text-sm"
              >
                <option value="Low">Thấp (Low)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="High">Cao (High)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white text-sm"
              >
                <option value="To Do">To Do</option>
                <option value="In progress">In progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div>
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
                errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
              }`}
            />
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-emerald-500/30 transition-all duration-300 cursor-pointer"
            >
              {taskToEdit ? "Lưu thay đổi" : "Lưu công việc"}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default TaskModal;