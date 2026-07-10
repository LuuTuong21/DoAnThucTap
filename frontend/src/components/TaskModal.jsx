import React from 'react';

function TaskModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    // Thêm animation mờ dần vào nền
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      
      {/* Khung Modal */}
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleUp_0.2s_ease-out]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Thêm công việc mới
        </h2>
        
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề công việc</label>
            <input 
              type="text" 
              placeholder="Vd: Thiết kế Database..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea 
              rows="3"
              placeholder="Nhập chi tiết công việc cần làm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
            <input 
              type="datetime-local" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md transition-all duration-200"
            >
              Hủy bỏ
            </button>
            <button 
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
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