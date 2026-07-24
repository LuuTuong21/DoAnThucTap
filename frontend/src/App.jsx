import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import ProjectList from './components/ProjectList';
import ProjectDetail from "./components/ProjectDetail";
import Settings from './components/Settings';
import AdminUsers from './components/AdminUsers';

// --- 1. COMPONENT BẢO VỆ: KIỂM TRA XEM CÓ THẺ TOKEN CHƯA ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- 2. BẢNG KANBAN CHÍNH (CÔNG VIỆC CÁ NHÂN) ---
function KanbanBoard() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [taskToEdit, setTaskToEdit] = useState(null); // State quản lý task đang được sửa
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [boardData, setBoardData] = useState({
    "To Do": [],
    "In progress": [],
    "Done": []
  });

  // HÀM LẤY THẺ TOKEN TỪ STORAGE
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. API LẤY DANH SÁCH (GET)
  const fetchTasks = async () => {
    setIsLoading(true); 
    try {
      const response = await axios.get('https://kaban-api-backend-ro81.onrender.com/api/tasks?project_id=null', getAuthConfig()); 
      
      const allTasks = response.data.data || response.data.tasks || []; 

      setBoardData({
        "To Do": allTasks.filter(task => task.status === "To Do" || task.status === "todo" || !task.status),
        "In progress": allTasks.filter(task => task.status === "In Progress" || task.status === "In progress" || task.status === "in_progress"),
        "Done": allTasks.filter(task => task.status === "Done" || task.status === "done")
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

  // Mở Modal Tạo mới
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Mở Modal Chỉnh sửa
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // 2. API LƯU TASK (XỬ LÝ CẢ THÊM MỚI VÀ CẬP NHẬT)
  const handleSaveTask = async (taskPayload) => {
    const isEditing = Boolean(taskPayload.task_id);
    const toastId = toast.loading(isEditing ? "Đang cập nhật công việc..." : "Đang lưu công việc...");

    try {
      if (isEditing) {
        // Cập nhật công việc hiện có (PUT)
        await axios.put(`https://kaban-api-backend-ro81.onrender.com/api/tasks/${taskPayload.task_id}`, {
          title: taskPayload.title,
          description: taskPayload.description,
          deadline: taskPayload.deadline,
          priority: taskPayload.priority,
          status: taskPayload.status || "To Do"
        }, getAuthConfig());

        toast.success("Cập nhật công việc thành công!", { id: toastId });
      } else {
        // Tạo công việc mới (POST)
        const { task_id, ...taskData } = taskPayload;
        const payloadToSubmit = {
          ...taskData,
          status: "To Do", 
          project_id: null    
        };
        await axios.post('https://kaban-api-backend-ro81.onrender.com/api/tasks', payloadToSubmit, getAuthConfig());

        toast.success("Thêm công việc thành công!", { id: toastId });
      }

      setIsModalOpen(false); 
      setTaskToEdit(null);
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi Save Task:", error);
      toast.error("Thao tác thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  // 3. API CẬP NHẬT TRẠNG THÁI TASK (PUT)
  const handleMoveTask = async (taskId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return; 

    const fullTask = boardData[currentStatus].find(t => t.task_id === taskId);
    if (!fullTask) return;

    const toastId = toast.loading("Đang luân chuyển công việc...");

    try {
      await axios.put(`https://kaban-api-backend-ro81.onrender.com/api/tasks/${taskId}`, {
        title: fullTask.title,
        description: fullTask.description,
        deadline: fullTask.deadline,
        priority: fullTask.priority, 
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
      await axios.delete(`https://kaban-api-backend-ro81.onrender.com/api/tasks/${taskId}`, getAuthConfig());
      
      toast.success("Đã xóa thành công!", { id: toastId });
      fetchTasks(); 
      
    } catch (error) {
      console.error("Lỗi DELETE:", error);
      toast.error("Xóa thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans relative">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-600 uppercase tracking-wider drop-shadow-sm">
            Công việc cá nhân
          </h1>
  
          <div className="flex gap-4">
            <button 
              onClick={handleOpenCreateModal} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors cursor-pointer"
            >
              + Thêm công việc
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                      onEditTask={handleOpenEditModal}
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
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }} 
        onAddTask={handleSaveTask} 
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

// --- 3. COMPONENT APP GỐC: KHỞI TẠO CÁC ĐƯỜNG DẪN (ROUTER) ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route Công khai */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        
        {/* Route Trang chủ & Task cá nhân */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <KanbanBoard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Layout>
                <KanbanBoard />
              </Layout>
            </ProtectedRoute>
          } 
        />
  
        {/* Route Dự án nhóm */}
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:projectId" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Route Cài đặt */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Route Admin - Quản lý tài khoản người dùng */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Route Fallback khi nhập sai đường dẫn */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;