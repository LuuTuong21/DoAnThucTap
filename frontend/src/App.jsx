import { useState } from 'react';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

function App() {
  // Trạng thái bật/tắt của Modal thêm công việc
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Dữ liệu giả (Mock Data) bám sát cấu trúc Database
  const [boardData, setBoardData] = useState({
    "To Do": [
      { 
        task_id: 101, 
        title: "Thiết kế giao diện thẻ Task", 
        description: "Sử dụng Tailwind CSS để style cho TaskCard.jsx, đảm bảo có hover effect và hiển thị đủ Hạn chót.", 
        deadline: "2026-07-10" 
      },
      { 
        task_id: 102, 
        title: "Tạo form thêm công việc mới", 
        description: "Làm modal popup để điền thông tin title, description, deadline.", 
        deadline: "2026-07-12" 
      }
    ],
    "In progress": [
      { 
        task_id: 103, 
        title: "Cấu hình kết nối DB Backend", 
        description: "Bạn Backend đang dùng MySQL Workbench để cấu hình.", 
        deadline: "2026-07-09" 
      }
    ],
    "Done": [
      { 
        task_id: 104, 
        title: "Chốt API Contract", 
        description: "Đã thống nhất dùng RESTful API chuẩn JSON.", 
        deadline: "2026-07-08" 
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Phần Header */}
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Bảng Kanban Dự Án
          </h1>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            + Thêm công việc
          </button>
        </header>
        
        {/* Khung Bảng Kanban */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {Object.keys(boardData).map((statusName) => (
            // Thêm hiệu ứng hover:bg-gray-200 và transition-colors của Ngày 5
            <div key={statusName} className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300 rounded-xl w-full md:w-1/3 p-4 flex flex-col max-h-[80vh]">
              
              {/* Tiêu đề Cột */}
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
                  {statusName} 
                  <span className="ml-2 bg-gray-300 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                    {boardData[statusName].length}
                  </span>
                </h2>
              </div>
              
              {/* Danh sách Thẻ TaskCard */}
              <div className="flex flex-col gap-3 overflow-y-auto pb-2 flex-1">
                {boardData[statusName].map((task) => (
                  <TaskCard key={task.task_id} task={task} />
                ))}
              </div>
              
            </div>
          ))}
          
        </div>

      </div>

      {/* Component Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}

export default App;