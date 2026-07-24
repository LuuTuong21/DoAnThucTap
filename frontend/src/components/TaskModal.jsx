import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Hàm format date từ API sang chuẩn "YYYY-MM-DDTHH:mm" cho input datetime-local (không bị lệch múi giờ)
const formatToDatetimeLocal = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function TaskModal({ 
  isOpen, 
  onClose, 
  onAddTask, 
  taskToEdit, 
  members = [],    // Danh sách thành viên (cho Project)
  isProject = false // Đánh dấu nếu là Task trong dự án
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setStatus(taskToEdit.status || 'To Do');
      setDeadline(formatToDatetimeLocal(taskToEdit.deadline));
      setAssignedTo(taskToEdit.assigned_to || '');
    } else {
      // Reset form khi tạo mới
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setDeadline('');
      setAssignedTo('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề công việc!");
      return;
    }

    // BẮT BUỘC NHẬP DEADLINE CHO PROJECT TASK
    if (isProject && !deadline) {
      toast.error("Vui lòng chọn hạn chót (Deadline) cho dự án!");
      return;
    }

    // XỬ LÝ LỖI LỆCH 7 TIẾNG: Chuyển "YYYY-MM-DDTHH:mm" thành "YYYY-MM-DD HH:mm:00"
    let formattedDeadline = null;
    if (deadline) {
      formattedDeadline = deadline.replace('T', ' ') + ':00';
    }

    const payload = {
      ...(taskToEdit?.task_id && { task_id: taskToEdit.task_id }),
      title: title.trim(),
      description: description.trim(),
      priority,
      status, // Lấy đúng status người dùng đã chọn
      deadline: formattedDeadline,
      assigned_to: assignedTo || null
    };

    onAddTask(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {taskToEdit ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Độ ưu tiên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Độ ưu tiên</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Low">Low (Thấp)</option>
                <option value="Medium">Medium (Trung bình)</option>
                <option value="High">High (Cao)</option>
              </select>
            </div>

            {/* Trạng thái (Cho phép chọn ngay từ khi tạo mới) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="To Do">To Do</option>
                <option value="In progress">In progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Hạn chót Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hạn chót (Deadline) {isProject && <span className="text-red-500">*</span>}
            </label>
            <input 
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required={isProject}
            />
          </div>

          {/* Chọn người thực hiện (nếu là Project Task) */}
          {isProject && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Người thực hiện</label>
              <select 
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="">-- Chọn thành viên --</option>
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name || m.email} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nút thao tác */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors"
            >
              {taskToEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;