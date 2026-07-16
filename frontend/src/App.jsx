import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  const [boardData, setBoardData] = useState({
    "To Do": [],
    "In progress": [],
    "Done": []
  });

  // 1. API LẤY DANH SÁCH (GET)
const fetchTasks = async () => {
    setIsLoading(true); 
    try {
      const response = await axios.get('http://26.76.97.99:5000/api/tasks'); 
      
      // Lúc này response.data.data là một MẢNG chứa TẤT CẢ công việc
      const allTasks = response.data.data; 

      // FRONTEND TỰ RA TAY PHÂN LOẠI DỮ LIỆU:
      setBoardData({
        "To Do": allTasks.filter(task => task.status === "To Do"),
        // Lưu ý: BE đang trả về chữ "In Progress" (chữ P viết hoa)
        "In progress": allTasks.filter(task => task.status === "In Progress" || task.status === "In progress"),
        "Done": allTasks.filter(task => task.status === "Done")
      });

    } catch (error) {
      console.error("Lỗi Fetch:", error);
      toast.error("Không thể kết nối đến máy chủ!"); 
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. API TẠO TASK MỚI (POST)
  const handleAddTask = async (newTask) => {
    const { task_id, ...taskData } = newTask; // Bỏ ID ảo do FE tự tạo
    const toastId = toast.loading("Đang lưu công việc...");

    // Đóng gói dữ liệu chuẩn theo yêu cầu của BE
    const payloadToSubmit = {
      ...taskData,
      status: "To Do", 
      board_id: 1      
    };

    try {
      // Gắn link POST /api/tasks
      await axios.post('http://26.76.97.99:5000/api/tasks', payloadToSubmit);
      
      toast.success("Thêm công việc thành công!", { id: toastId });
      setIsModalOpen(false); // Đóng modal khi thêm thành công
      fetchTasks(); // Tải lại danh sách
      
    } catch (error) {
      console.error("Lỗi POST:", error);
      toast.error("Thêm thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  // 3. API CẬP NHẬT TRẠNG THÁI TASK (PUT)
  const handleMoveTask = async (taskId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    // Tìm dữ liệu cũ để gửi kèm theo yêu cầu của BE
    const fullTask = boardData[currentStatus].find(t => t.task_id === taskId);
    if (!fullTask) return;

    const toastId = toast.loading("Đang luân chuyển công việc...");

    try {
      // Gắn link PUT /api/tasks/:id
      await axios.put(`http://26.76.97.99:5000/api/tasks/${taskId}`, {
        title: fullTask.title,
        description: fullTask.description,
        deadline: fullTask.deadline,
        status: newStatus 
      });

      toast.success(`Đã chuyển sang ${newStatus}!`, { id: toastId });
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi UPDATE:", error);
      toast.error("Chuyển cột thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  // 4. API XÓA TASK (DELETE)
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa công việc này không?");
    if (!confirmDelete) return;

    const toastId = toast.loading("Đang xóa công việc...");

    try {
      // Gắn link DELETE /api/tasks/:id
      await axios.delete(`http://26.76.97.99:5000/api/tasks/${taskId}`);
      
      toast.success("Đã xóa thành công!", { id: toastId });
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi DELETE:", error);
      toast.error("Xóa thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans relative">
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
                      {boardData[statusName]?.length || 0}
                    </span>
                  </h2>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto pb-2 flex-1">
                  {boardData[statusName]?.map((task) => (
                    <TaskCard 
                      key={task.task_id} 
                      task={task} 
                      currentStatus={statusName} 
                      allStatuses={Object.keys(boardData)} 
                      onMoveTask={handleMoveTask} 
                      onDeleteTask={handleDeleteTask}
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