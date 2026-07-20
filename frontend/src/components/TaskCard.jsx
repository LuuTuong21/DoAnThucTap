import React from 'react';

function TaskCard({ task, currentStatus, allStatuses, onMoveTask, onDeleteTask }) {
  
  // Hàm chuyển đổi chuỗi thời gian của BE thành định dạng Việt Nam
  const formatDeadline = (dateString) => {
    if (!dateString) return "Chưa có hạn";
    const date = new Date(dateString);
    
    // Nếu BE trả về chuỗi lỗi không đọc được ngày thì giữ nguyên
    if (isNaN(date.getTime())) return dateString; 
    
    // Format thành dạng: 17/07/2026 23:59
    return date.toLocaleDateString('vi-VN') + ' - ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 group relative">
      
      {/* Khu vực nút bấm góc trên bên phải (chỉ hiện khi hover) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center">
        
        {/* Nút thả xuống để đổi cột */}
        <select 
          value={currentStatus}
          onChange={(e) => onMoveTask(task.task_id, currentStatus, e.target.value)}
          className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-gray-50 text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {allStatuses?.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Nút Xóa công việc */}
        <button 
          onClick={() => onDeleteTask(task.task_id)}
          className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 px-1.5 py-0.5 rounded border border-gray-300 hover:border-red-300 text-xs font-medium"
          title="Xóa công việc"
        >
          ✕
        </button>
      </div>

      <h3 className="font-semibold text-gray-800 text-sm mb-2 group-hover:text-blue-600 transition-colors pr-24">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-red-500 font-medium">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {/* GỌI HÀM FORMAT TẠI ĐÂY */}
          {formatDeadline(task.deadline)}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;