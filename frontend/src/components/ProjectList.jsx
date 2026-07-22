import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ProjectModal from './ProjectModal'; // Thêm dòng này

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State quản lý Modal

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://kaban-api-backend-ro81.onrender.com/api/projects', getAuthConfig());
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách dự án:", error);
      toast.error("Không thể tải danh sách dự án!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Hàm gọi API Tạo dự án mới
  const handleAddProject = async (projectData) => {
    const toastId = toast.loading("Đang tạo dự án...");
    try {
      await axios.post('https://kaban-api-backend-ro81.onrender.com/api/projects', projectData, getAuthConfig());
      
      toast.success("Tạo dự án thành công!", { id: toastId });
      setIsModalOpen(false); // Đóng modal
      fetchProjects(); // Gọi lại danh sách để hiện dự án vừa tạo
      
    } catch (error) {
      console.error("Lỗi tạo dự án:", error);
      toast.error("Tạo dự án thất bại, vui lòng thử lại!", { id: toastId });
    }
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex justify-between items-center">
        <Toaster position="top-right" reverseOrder={false} />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-600 uppercase tracking-wider drop-shadow-sm">
          Dự án của tôi
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)} // Gắn sự kiện mở Modal
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Tạo dự án mới
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 mb-4">Bạn chưa tham gia dự án nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.project_id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors pr-2 break-all">
                    {project.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {project.role || 'Member'}
                  </span>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-4">
                  Tạo ngày: {new Date(project.created_at).toLocaleDateString('vi-VN')}
                </div>
                <Link 
                  to={`/projects/${project.project_id}`}
                  className="block text-center w-full bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 py-2 rounded-md font-medium border border-gray-200 hover:border-emerald-200 transition-colors"
                >
                  Vào bảng công việc
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nhúng Modal vào cuối Component */}
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddProject={handleAddProject} 
      />
    </div>
  );
}

export default ProjectList;