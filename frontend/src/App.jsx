import { useState } from 'react'

function App() {
  // 1. Tạo Mock Data theo đúng cấu trúc API Contract đã chốt
  const [boardData, setBoardData] = useState({
    "To Do": [
      { task_id: 1, title: "Thiết kế giao diện thẻ Task", deadline: "2026-07-10" },
      { task_id: 2, title: "Viết hàm kéo thả", deadline: "2026-07-12" }
    ],
    "In progress": [
      { task_id: 3, title: "Chia cột giao diện", deadline: "2026-07-08" }
    ],
    "Done": [
      { task_id: 4, title: "Cài đặt React Vite và Tailwind", deadline: "2026-07-07" }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Bảng Kanban Thực Tập
      </h1>
      
      {/* 2. Khung Bảng Kanban: Chia 3 cột bằng Flexbox */}
      <div className="flex flex-col md:flex-row gap-6 justify-center max-w-7xl mx-auto">
        
        {/* Lặp qua 3 key: To Do, In progress, Done */}
        {Object.keys(boardData).map((statusName) => (
          
          <div key={statusName} className="bg-gray-200 rounded-xl w-full md:w-1/3 p-4 shadow">
            {/* Tiêu đề cột */}
            <h2 className="font-semibold text-lg mb-4 text-gray-700 border-b-2 border-gray-300 pb-2">
              {statusName} <span className="text-sm font-normal text-gray-500">({boardData[statusName].length})</span>
            </h2>
            
            {/* 3. Đổ danh sách Task vào cột */}
            <div className="flex flex-col gap-3 min-h-50">
              {boardData[statusName].map((task) => (
                
                // Giao diện tĩnh của một thẻ Task
                <div key={task.task_id} className="bg-white p-4 rounded shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow">
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-2">⏳ Hạn: {task.deadline}</p>
                </div>
                
              ))}
            </div>
          </div>
          
        ))}
        
      </div>
    </div>
  )
}

export default App