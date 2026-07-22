import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Modal thêm Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState(''); 
  const [taskDeadline, setTaskDeadline] = useState('');

  // State cho Modal thêm thành viên
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');

  // State hỗ trợ tìm kiếm thành viên theo tên hoặc email
  const [memberSearch, setMemberSearch] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  // Hàm tải thông tin dự án, danh sách task và thành viên
  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://kaban-api-backend-ro81.onrender.com/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProject(response.data.project);
        setTasks(response.data.tasks || []);
        setMembers(response.data.members || []);
        if (response.data.members && response.data.members.length > 0) {
          setAssignedTo(response.data.members[0].user_id);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết dự án:", err);
      setError("Không thể tải thông tin dự án hoặc bạn không có quyền truy cập.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Hàm xử lý tạo Task mới
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!assignedTo) {
      alert("Vui lòng chọn người thực hiện công việc!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://kaban-api-backend-ro81.onrender.com/api/projects/${projectId}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        status: 'To Do', 
        assigned_to: assignedTo,
        deadline: taskDeadline || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsModalOpen(false);
        setTaskTitle('');
        setTaskDesc('');
        setTaskPriority('Medium');
        setTaskDeadline('');
        setMemberSearch('');
        fetchProjectData();
      }
    } catch (err) {
      console.error("Lỗi tạo task:", err);
      alert(err.response?.data?.message || "Không thể tạo công việc mới!");
    }
  };

  // Hàm thay đổi trạng thái task trực tiếp
  const handleStatusChange = async (task, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://kaban-api-backend-ro81.onrender.com/api/projects/${projectId}/tasks/${task.task_id}`, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        assigned_to: task.assigned_to,
        deadline: task.deadline
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjectData(); // Load lại dữ liệu sau khi đổi trạng thái
    } catch (err) {
      console.error("Lỗi đổi trạng thái task:", err);
      alert("Không thể cập nhật trạng thái công việc!");
    }
  };

  // Hàm xử lý thêm thành viên vào dự án
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://kaban-api-backend-ro81.onrender.com/api/projects/${projectId}/members`, {
        email: newMemberEmail,
        role: newMemberRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert("Thêm thành viên thành công!");
        setIsMemberModalOpen(false);
        setNewMemberEmail('');
        setNewMemberRole('Member');
        fetchProjectData();
      }
    } catch (err) {
      console.error("Lỗi thêm thành viên:", err);
      alert(err.response?.data?.message || "Không thể thêm thành viên!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-emerald-600 font-semibold text-lg">
        Đang tải bảng công việc...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/projects')}
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all cursor-pointer"
        >
          Quay lại danh sách dự án
        </button>
      </div>
    );
  }

  // Phân loại task theo trạng thái Kanban
  const todoTasks = tasks.filter(t => t.status === 'To Do' || t.status === 'todo' || !t.status);
  const inProgressTasks = tasks.filter(t => t.status === 'In progress' || t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'Done' || t.status === 'done');

  // Hàm lấy tên người thực hiện dựa vào user_id
  const getAssigneeName = (userId) => {
    const member = members.find(m => m.user_id === userId);
    return member ? (member.name || member.email) : 'Chưa phân công';
  };

  // Lọc danh sách thành viên theo tên hoặc email
  const filteredMembers = members.filter(m => 
    (m.name && m.name.toLowerCase().includes(memberSearch.toLowerCase())) ||
    (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const selectedMember = members.find(m => m.user_id === assignedTo);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* Header trang chi tiết */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <button 
            onClick={() => navigate('/projects')}
            className="text-sm text-emerald-600 hover:underline mb-1 inline-block font-medium cursor-pointer"
          >
            ← Quay lại danh sách dự án
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {project ? project.name : "Chi tiết dự án"}
          </h1>
          <p className="text-sm text-gray-500">{project?.description || "Không có mô tả"}</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsMemberModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all cursor-pointer"
          >
            + Thêm thành viên
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
          >
            + Thêm Task mới
          </button>
        </div>
      </div>

      {/* Khu vực hiển thị danh sách thành viên dự án */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-2">👥 Thành viên tham gia dự án ({members.length})</h3>
        <div className="flex flex-wrap gap-2">
          {members.map(m => (
            <div key={m.user_id} className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-800">{m.name || m.email}</span>
              <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-medium">{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng Kanban 3 cột */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grow">
        
        {/* Cột 1: To Do */}
        <div className="bg-gray-100/80 rounded-xl p-4 flex flex-col border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>📌 To Do</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{todoTasks.length}</span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto grow">
            {todoTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có công việc nào</p>
            ) : (
              todoTasks.map(task => (
                <div key={task.task_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-600' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{task.description}</p>
                  
                  {/* Thanh công cụ phụ: Người thực hiện, hạn chót và đổi trạng thái */}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-2 mt-1">
                    <span>👤 {getAssigneeName(task.assigned_to)}</span>
                    {task.deadline && <span>🕒 {new Date(task.deadline).toLocaleString()}</span>}
                  </div>

                  {/* Dropdown chuyển đổi trạng thái nhanh */}
                  <div className="flex justify-end mt-1">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="text-[11px] bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In progress">In progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột 2: In Progress */}
        <div className="bg-gray-100/80 rounded-xl p-4 flex flex-col border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>⚡ In progress</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto grow">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có công việc nào</p>
            ) : (
              inProgressTasks.map(task => (
                <div key={task.task_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-600' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-2 mt-1">
                    <span>👤 {getAssigneeName(task.assigned_to)}</span>
                    {task.deadline && <span>🕒 {new Date(task.deadline).toLocaleString()}</span>}
                  </div>

                  <div className="flex justify-end mt-1">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="text-[11px] bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In progress">In progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột 3: Done */}
        <div className="bg-gray-100/80 rounded-xl p-4 flex flex-col border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>✅ Done</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{doneTasks.length}</span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto grow">
            {doneTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có công việc nào</p>
            ) : (
              doneTasks.map(task => (
                <div key={task.task_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 opacity-90 hover:shadow-md transition-shadow flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 text-sm line-through">{task.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{task.priority}</span>
                  </div>
                  <p className="text-xs text-gray-500">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-2 mt-1">
                    <span>👤 {getAssigneeName(task.assigned_to)}</span>
                    {task.deadline && <span>🕒 {new Date(task.deadline).toLocaleString()}</span>}
                  </div>

                  <div className="flex justify-end mt-1">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="text-[11px] bg-gray-50 border border-gray-300 rounded px-2 py-1 font-medium text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In progress">In progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal Thêm Task Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo công việc mới</h2>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề công việc <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={taskTitle} 
                  onChange={(e) => setTaskTitle(e.target.value)} 
                  placeholder="Nhập tiêu đề..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  value={taskDesc} 
                  onChange={(e) => setTaskDesc(e.target.value)} 
                  placeholder="Nhập mô tả chi tiết..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 resize-none h-20 text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Độ ưu tiên <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={taskPriority} 
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Phần tìm kiếm và chọn người thực hiện bằng tên hoặc email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người thực hiện <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Gõ tên hoặc email..."
                    value={isMemberDropdownOpen ? memberSearch : (selectedMember ? (selectedMember.name || selectedMember.email) : '')}
                    onFocus={() => {
                      setIsMemberDropdownOpen(true);
                      setMemberSearch('');
                    }}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setIsMemberDropdownOpen(true);
                    }}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  
                  {isMemberDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredMembers.length === 0 ? (
                        <div className="p-2 text-xs text-gray-500 text-center">Không tìm thấy kết quả phù hợp</div>
                      ) : (
                        filteredMembers.map(member => (
                          <div 
                            key={member.user_id}
                            onClick={() => {
                              setAssignedTo(member.user_id);
                              setMemberSearch('');
                              setIsMemberDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer flex flex-col gap-0.5 border-b border-gray-50 last:border-none"
                          >
                            <span className="font-semibold text-gray-800">{member.name || "Chưa đặt tên"}</span>
                            <span className="text-gray-500 text-[11px]">{member.email}</span>
                            <span className="text-gray-400 text-[10px]">Vai trò: {member.role}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ô chọn Ngày và Giờ phút (datetime-local) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn chót (Deadline) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={taskDeadline} 
                  onChange={(e) => setTaskDeadline(e.target.value)} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium shadow-md shadow-emerald-500/20 cursor-pointer text-sm"
                >
                  Tạo task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Thành Viên */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thêm thành viên vào dự án</h2>
            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email thành viên <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  required
                  value={newMemberEmail} 
                  onChange={(e) => setNewMemberEmail(e.target.value)} 
                  placeholder="Nhập email tài khoản..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select 
                  value={newMemberRole} 
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Member">Member</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-md shadow-blue-500/20 cursor-pointer text-sm"
                >
                  Thêm thành viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;