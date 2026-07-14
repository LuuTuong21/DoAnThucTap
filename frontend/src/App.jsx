import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Import thư viện thông báo
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // State mới để quản lý trạng thái đang tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);

  const [boardData, setBoardData] = useState({
    "To Do": [],
    "In progress": [],
    "Done": []
  });

  // HÀM 1: GỌI API LẤY DANH SÁCH (GET)
  const fetchTasks = async () => {
    setIsLoading(true); // Bật hiệu ứng loading
    try {
      // (Nhắc BE cung cấp đúng link này cho bạn)
      const response = await axios.get('http://localhost:5000/api/tasks'); 
      const taskData = response.data.data; 

      setBoardData({
        "To Do": taskData.todo,
        "In progress": taskData.inProgress,
        "Done": taskData.done
      });
    } catch (error) {
      console.error("Lỗi Fetch:", error);
      toast.error("Không thể kết nối đến máy chủ!"); // Bật thông báo lỗi
    } finally {
      setIsLoading(false); // Tắt hiệu ứng loading dù thành công hay thất bại
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // HÀM 2: GỌI API TẠO TASK MỚI (POST)
  const handleAddTask = async (newTask) => {
    // Lưu ý: Tạm thời xóa task_id do FE sinh ra, để Database tự động tạo ID chuẩn (Auto Increment)
    const { task_id, ...taskDataToSubmit } = newTask;

    // Hiển thị trạng thái đang xử lý trên thông báo
    const toastId = toast.loading("Đang lưu công việc...");

    try {
      // Gửi dữ liệu xuống Backend
      await axios.post('http://localhost:5000/api/tasks', taskDataToSubmit);
      
      // Báo thành công và tải lại danh sách mới nhất từ DB
      toast.success("Thêm công việc thành công!", { id: toastId });
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi POST:", error);
      toast.error("Thêm thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  // Hàm handleMoveTask tạm thời giữ nguyên logic UI (Sẽ cắm API Đổi cột vào Ngày 11)
  const handleMoveTask = (taskId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    setBoardData((prevData) => {
      const taskToMove = prevData[currentStatus].find(t => t.task_id === taskId);
      const updatedCurrentColumn = prevData[currentStatus].filter(t => t.task_id !== taskId);
      const updatedNewColumn = [...prevData[newStatus], taskToMove];

      return {
        ...prevData,
        [currentStatus]: updatedCurrentColumn,
        [newStatus]: updatedNewColumn
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans relative">
      
      {/* Khởi tạo bộ máy phát thông báo của react-hot-toast */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
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
        
        {/* HIỂN THỊ LOADING KHI ĐANG FETCH API */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {Object.keys(boardData).map((statusName) => (
              <div key={statusName} className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300 rounded-xl w-full md:w-1/3 p-4 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
                    {statusName} 
                    <span className="ml-2 bg-gray-300 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                      {boardData[statusName].length}
                    </span>
                  </h2>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto pb-2 flex-1">
                  {boardData[statusName].map((task) => (
                    <TaskCard 
                      key={task.task_id} 
                      task={task} 
                      currentStatus={statusName} 
                      allStatuses={Object.keys(boardData)} 
                      onMoveTask={handleMoveTask} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTask={handleAddTask} 
      />
    </div>
  );
}

export default App;