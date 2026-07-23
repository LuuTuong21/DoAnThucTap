import React from 'react';

function TaskCard({ task, currentStatus, allStatuses, onMoveTask, onDeleteTask, onEditTask }) {
  
  // Hàm chuyển đổi chuỗi thời gian của BE thành định dạng Việt Nam
  const formatDeadline = (dateString) => {
    if (!dateString) return "Chưa có hạn";
    const date = new Date(dateString);
    
    // Nếu BE trả về chuỗi lỗi không đọc được ngày thì giữ nguyên
    if (isNaN(date.getTime())) return dateString; 
    
    // Format thành dạng: 17/07/2026 - 23:59
    return date.toLocaleDateString('vi-VN') + ' - ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Hàm lấy màu sắc tự động dựa trên mức độ ưu tiên (Priority)
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    // Đã cố định đứng yên hoàn toàn khi hover
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-400 transition-all duration-300 group relative">
      
      {/* Khu vực nút bấm góc trên bên phải (chỉ hiện khi hover) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 items-center z-10">
        
        {/* Nút thả xuống để đổi cột */}
        {allStatuses && onMoveTask && (
          <select 
            value={currentStatus}
            onChange={(e) => onMoveTask(task.task_id, currentStatus, e.target.value)}
            className="text-xs border border-gray-300 rounded px-1 py-1 bg-gray-50 text-gray-600 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {allStatuses?.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        )}

        {/* Nút Chỉnh sửa công việc */}
        {onEditTask && (
          <button 
            onClick={() => onEditTask(task)}
            className="text-gray-500 hover:text-emerald-600 transition-colors bg-gray-50 hover:bg-emerald-50 p-1 rounded border border-gray-300 hover:border-emerald-300 text-xs font-medium cursor-pointer flex items-center justify-center"
            title="Chỉnh sửa công việc"
          >
            ✏️
          </button>
        )}

        {/* Nút Xóa công việc - ĐÃ ĐỔI THÀNH EMOJI THÙNG RÁC 🗑️ GIỐNG BẢNG DỰ ÁN */}
        {onDeleteTask && (
          <button 
            onClick={() => onDeleteTask(task.task_id)}
            className="text-gray-500 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-1 rounded border border-gray-300 hover:border-red-300 text-xs font-medium cursor-pointer flex items-center justify-center"
            title="Xóa công việc"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Tiêu đề công việc */}
      <h3 className="font-semibold text-gray-800 text-sm mb-2 group-hover:text-emerald-600 transition-colors pr-28 break-all">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 break-all whitespace-normal">
          {task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        
        {/* Góc trái: Hạn chót */}
        <div className="flex items-center text-xs text-red-500 font-medium">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {formatDeadline(task.deadline)}
        </div>

        {/* Góc phải: Nhãn Mức độ ưu tiên (PRIORITY) */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getPriorityStyles(task.priority)}`}>
          {task.priority || 'Medium'}
        </span>

      </div>
    </div>
  );
}

export default TaskCard;