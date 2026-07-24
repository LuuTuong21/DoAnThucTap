import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://kaban-api-backend-ro81.onrender.com/api';

// Hàm chuyển Date từ API sang dạng "YYYY-MM-DDTHH:mm" cho datetime-local (Không bị cộng/trừ 7 tiếng)
const formatToDatetimeLocal = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Hàm giải mã JWT an toàn hỗ trợ Unicode/URL-safe base64
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Modal Tạo / Sửa Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  // State Modal thêm thành viên
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');

  // State Tìm kiếm người thực hiện trong Task Modal
  const [memberSearch, setMemberSearch] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);

  // Helper lấy config Authorization
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Lấy User ID hiện tại từ Token
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    const decoded = decodeJWT(token);
    return decoded ? decoded.id || decoded.user_id : null;
  };

  const currentUserId = getCurrentUserId();
  const currentMemberInfo = members.find((m) => m.user_id === currentUserId);
  const isLeader = currentMemberInfo ? currentMemberInfo.role?.toLowerCase() === 'leader' : false;

  // Đóng dropdown chọn người thực hiện khi click ra bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMemberDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tải dữ liệu dự án
  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, getAuthHeader());

      if (response.data.success) {
        setProject(response.data.project);
        setTasks(response.data.tasks || []);
        const memberList = response.data.members || [];
        setMembers(memberList);

        if (memberList.length > 0 && !assignedTo) {
          setAssignedTo(memberList[0].user_id);
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

  // Mở modal tạo Task
  const openCreateModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskStatus('To Do');
    setTaskDeadline('');
    setMemberSearch('');
    if (members.length > 0) setAssignedTo(members[0].user_id);
    setIsModalOpen(true);
  };

  // Mở modal sửa Task (Đã sửa không bị lệch giờ)
  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority || 'Medium');
    setTaskStatus(task.status || 'To Do');
    setAssignedTo(task.assigned_to);
    setTaskDeadline(formatToDatetimeLocal(task.deadline)); // 👈 ĐÃ SỬA: Dùng hàm format local chuẩn
    setIsModalOpen(true);
  };

  // Lưu Task (Đã thêm kiểm tra bắt buộc Deadline & sửa lỗi lệch 7 giờ)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!assignedTo) {
      alert("Vui lòng chọn người thực hiện công việc!");
      return;
    }

    // 👈 BẮT BUỘC NHẬP DEADLINE CHO PROJECT TASK
    if (!taskDeadline) {
      alert("Vui lòng chọn hạn chót (Deadline) cho công việc dự án!");
      return;
    }

    // 👈 CHUYỂN "YYYY-MM-DDTHH:mm" THÀNH "YYYY-MM-DD HH:mm:00" ĐỂ LƯU VÀO CSDL
    const formattedDeadline = taskDeadline.replace('T', ' ') + ':00';

    const payload = {
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      status: taskStatus,
      assigned_to: assignedTo,
      deadline: formattedDeadline
    };

    try {
      if (editingTask) {
        await axios.put(`${API_BASE_URL}/projects/${projectId}/tasks/${editingTask.task_id}`, payload, getAuthHeader());
      } else {
        await axios.post(`${API_BASE_URL}/projects/${projectId}/tasks`, payload, getAuthHeader());
      }

      setIsModalOpen(false);
      fetchProjectData();
    } catch (err) {
      console.error("Lỗi lưu task:", err);
      alert(err.response?.data?.message || "Không thể lưu công việc!");
    }
  };

  // Xóa Task
  const handleDeleteTask = async (taskId) => {
    if (!isLeader) return alert("Thành viên không có quyền xóa công việc!");
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, getAuthHeader());
      fetchProjectData();
    } catch (err) {
      console.error("Lỗi xóa task:", err);
      alert(err.response?.data?.message || "Không thể xóa công việc này!");
    }
  };

  // Xóa Dự Án
  const handleDeleteProject = async () => {
    if (!isLeader) return alert("Chỉ Trưởng dự án (Leader) mới được phép xóa dự án này!");
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ dự án này không? Thao tác này không thể hoàn tác!")) return;

    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`, getAuthHeader());
      alert("Đã xóa dự án thành công!");
      navigate('/projects');
    } catch (err) {
      console.error("Lỗi xóa dự án:", err);
      alert(err.response?.data?.message || "Không thể xóa dự án này!");
    }
  };

  // Xóa Thành Viên khỏi Dự Án
  const handleRemoveMember = async (memberId, memberName) => {
    if (!isLeader) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${memberName}" khỏi dự án này?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, getAuthHeader());
      alert("Đã xóa thành viên thành công!");
      fetchProjectData();
    } catch (err) {
      console.error("Lỗi xóa thành viên:", err);
      alert(err.response?.data?.message || "Không thể xóa thành viên!");
    }
  };

  // Đổi trạng thái Task nhanh
  const handleStatusChange = async (task, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/projects/${projectId}/tasks/${task.task_id}`,
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: newStatus,
          assigned_to: task.assigned_to,
          deadline: task.deadline
        },
        getAuthHeader()
      );
      fetchProjectData();
    } catch (err) {
      console.error("Lỗi đổi trạng thái task:", err);
      alert("Không thể cập nhật trạng thái công việc!");
    }
  };

  // Thêm Thành Viên
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/projects/${projectId}/members`,
        { email: newMemberEmail, role: newMemberRole },
        getAuthHeader()
      );

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

  // Phân loại Task
  const todoTasks = tasks.filter((t) => t.status === 'To Do' || t.status === 'todo' || !t.status);
  const inProgressTasks = tasks.filter((t) => t.status === 'In progress' || t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done' || t.status === 'done');

  const getAssigneeName = (userId) => {
    const member = members.find((m) => m.user_id === userId);
    return member ? member.name || member.email : 'Chưa phân công';
  };

  const filteredMembers = members.filter(
    (m) =>
      (m.name && m.name.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const selectedMember = members.find((m) => m.user_id === assignedTo);

  // Thẻ Task Card
  const renderTaskCard = (task) => (
    <div key={task.task_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col gap-2">
      <div className="flex justify-between items-start gap-2">
        <h4 className={`font-semibold text-gray-800 text-sm ${task.status === 'Done' || task.status === 'done' ? 'line-through opacity-75' : ''}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-600' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
            {task.priority}
          </span>

          {isLeader && (
            <>
              <button
                onClick={() => openEditModal(task)}
                title="Sửa công việc"
                className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteTask(task.task_id)}
                title="Xóa công việc"
                className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 whitespace-pre-line wrap-break-word break-all">{task.description}</p>

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
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="max-w-[70%]">
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-emerald-600 hover:underline mb-1 inline-block font-medium cursor-pointer"
          >
            ← Quay lại danh sách dự án
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {project ? project.name : "Chi tiết dự án"}
          </h1>
          <p className="text-sm text-gray-500 wrap-break-words break-all whitespace-pre-line mt-1">
            {project?.description || "Không có mô tả"}
          </p>
        </div>

        <div className="flex gap-3 items-center shrink-0">
          {isLeader && (
            <>
              <button
                onClick={handleDeleteProject}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
                title="Xóa dự án (Chỉ dành cho Leader)"
              >
                🗑️ Xóa dự án
              </button>
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all cursor-pointer"
              >
                + Thêm thành viên
              </button>
              <button
                onClick={openCreateModal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
              >
                + Thêm Task mới
              </button>
            </>
          )}
        </div>
      </div>

      {/* Danh sách thành viên */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-2">👥 Thành viên tham gia dự án ({members.length})</h3>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <div key={m.user_id} className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-800">{m.name || m.email}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${m.role?.toLowerCase() === 'leader' ? 'bg-purple-100 text-purple-700 font-bold' : 'bg-emerald-100 text-emerald-700'}`}>
                {m.role}
              </span>
              
              {isLeader && m.user_id !== currentUserId && (
                <button
                  onClick={() => handleRemoveMember(m.user_id, m.name || m.email)}
                  title="Xóa thành viên khỏi dự án"
                  className="text-gray-400 hover:text-red-600 font-bold ml-1 cursor-pointer transition-colors px-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bảng Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grow">
        {/* To Do */}
        <div className="bg-gray-100/80 rounded-xl p-4 flex flex-col border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>📌 To Do</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{todoTasks.length}</span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto grow">
            {todoTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có công việc nào</p>
            ) : (
              todoTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-gray-100/80 rounded-xl p-4 flex flex-col border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>⚡ In progress</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto grow">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có công việc nào</p>
            ) : (
              inProgressTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Done */}
        <div className="bg-gray-100/80 rounded-xl p-4 flex flex-col border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
            <span>✅ Done</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{doneTasks.length}</span>
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto grow">
            {doneTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Chưa có công việc nào</p>
            ) : (
              doneTasks.map(renderTaskCard)
            )}
          </div>
        </div>
      </div>

      {/* Modal Tạo/Sửa Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingTask ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
            </h2>
            <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In progress">In progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Chọn người thực hiện */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người thực hiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Gõ tên hoặc email..."
                  value={isMemberDropdownOpen ? memberSearch : selectedMember ? selectedMember.name || selectedMember.email : ''}
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
                      filteredMembers.map((member) => (
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

              {/* Hạn chót (Deadline - Bắt buộc nhập & Đã sửa không lệch 7 tiếng) */}
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
                  {editingTask ? "Cập nhật" : "Tạo task"}
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