import React from 'react';

function TaskCard({ task }) {
  return (
    // Đã cập nhật hiệu ứng chuyển động mượt (duration-300) và nhấc thẻ lên (hover:-translate-y-1)
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 cursor-grab transition-all duration-300 hover:-translate-y-1 group">
      <h3 className="font-semibold text-gray-800 text-sm mb-2 group-hover:text-blue-600 transition-colors">
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
          {task.deadline}
        </div>
        
        <span className="px-2 py-1 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
          ID: {task.task_id}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;