import { useState } from 'react';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal'; // 1. Thêm dòng import này

function App() {
  // 2. Thêm dòng này để tạo "công tắc" (mặc định là false - đang tắt)
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const [boardData, setBoardData] = useState({
    // ... (Giữ nguyên cục Mock Data của bạn ở đây) ...
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Bảng Kanban Dự Án
          </h1>
          
          {/* 3. Sửa lại nút button này: Thêm sự kiện onClick để bật công tắc */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            + Thêm công việc
          </button>
        </header>
        
        {/* Khung Bảng Kanban */}
        <div className="flex flex-col md:flex-row gap-6">
            {/* ... (Giữ nguyên đoạn code render 3 cột ở đây) ... */}
        </div>

      </div>

      {/* 4. Thêm Modal vào cuối cùng (ngay trên thẻ đóng </div> cuối cùng) */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}

export default App;