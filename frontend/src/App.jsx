import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';

// --- 1. COMPONENT BẢO VỆ: KỂM TRA XEM CÓ THẺ TOKEN CHƯA ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- 2. BẢNG KANBAN CHÍNH (ĐƯỢC ĐỔI TÊN TỪ APP -> KANBANBOARD) ---
function KanbanBoard() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Dùng để chuyển trang khi Đăng xuất

  const [boardData, setBoardData] = useState({
    "To Do": [],
    "In progress": [],
    "Done": []
  });

  // HÀM LẤY THẺ TOKEN TỪ KÉT SẮT
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. API LẤY DANH SÁCH (GET)
  const fetchTasks = async () => {
    setIsLoading(true); 
    try {
      // Đã kẹp thẻ token vào getAuthConfig()
      const response = await axios.get('https://kaban-api-backend-ro81.onrender.com/api/tasks', getAuthConfig()); 
      
      const allTasks = response.data.data; 

      setBoardData({
        "To Do": allTasks.filter(task => task.status === "To Do"),
        "In progress": allTasks.filter(task => task.status === "In Progress" || task.status === "In progress"),
        "Done": allTasks.filter(task => task.status === "Done")
      });

    } catch (error) {
      console.error("Lỗi Fetch:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn!");
        navigate('/login');
      } else {
        toast.error("Không thể kết nối đến máy chủ!"); 
      }
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. API TẠO TASK MỚI (POST)
  const handleAddTask = async (newTask) => {
    const { task_id, ...taskData } = newTask;
    const toastId = toast.loading("Đang lưu công việc...");

    const payloadToSubmit = {
      ...taskData,
      status: "To Do", 
      board_id: 1      
    };

    try {
      // Đã kẹp thẻ token vào getAuthConfig()
      await axios.post('https://kaban-api-backend-ro81.onrender.com/api/tasks', payloadToSubmit, getAuthConfig());
      
      toast.success("Thêm công việc thành công!", { id: toastId });
      setIsModalOpen(false); 
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi POST:", error);
      toast.error("Thêm thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  // 3. API CẬP NHẬT TRẠNG THÁI TASK (PUT)
  const handleMoveTask = async (taskId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    const fullTask = boardData[currentStatus].find(t => t.task_id === taskId);
    if (!fullTask) return;

    const toastId = toast.loading("Đang luân chuyển công việc...");

    try {
      // Đã kẹp thẻ token vào getAuthConfig()
      await axios.put(`https://kaban-api-backend-ro81.onrender.com/api/tasks/${taskId}`, {
        title: fullTask.title,
        description: fullTask.description,
        deadline: fullTask.deadline,
        status: newStatus 
      }, getAuthConfig());

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
      // Đã kẹp thẻ token vào getAuthConfig()
      await axios.delete(`https://kaban-api-backend-ro81.onrender.com/api/tasks/${taskId}`, getAuthConfig());
      
      toast.success("Đã xóa thành công!", { id: toastId });
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi DELETE:", error);
      toast.error("Xóa thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  // HÀM ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('token'); // Ném thẻ token đi
    toast.success("Đã đăng xuất!");
    navigate('/login'); // Đá văng ra màn hình đăng nhập
  };

  return (
    <div className="min-h-screen bg-green-50 p-8 font-sans relative">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-600 uppercase tracking-wider drop-shadow-sm">
            Bảng Kanban Dự Án
          </h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
            >
              + Thêm công việc
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
            >
              Đăng Xuất
            </button>
          </div>
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

// --- 3. COMPONENT APP GỐC: KHỞI TẠO CÁC ĐƯỜNG DẪN (ROUTER) ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        
        {/* Đường dẫn trang chủ (Bảng Kanban) được bọc bởi lớp bảo vệ */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;