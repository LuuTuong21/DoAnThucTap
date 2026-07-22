import React, { useState, useEffect } from 'react';

function ProjectModal({ isOpen, onClose, onAddProject }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  // Reset form mỗi khi đóng/mở
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Tên dự án không được để trống.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); 
      return; 
    }

    // Đóng gói dữ liệu gửi ra ngoài
    const newProject = {
      name: name,
      description: description
    };

    onAddProject(newProject);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleUp_0.2s_ease-out]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Tạo dự án mới
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({...errors, name: ''});
              }} 
              placeholder="Vd: Dự án Website Bán Hàng"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-shadow ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn gọn</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục tiêu của dự án này là gì..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            ></textarea>
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
              Khởi tạo dự án
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ProjectModal;