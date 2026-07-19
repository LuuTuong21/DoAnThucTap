import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // --- PHẦN GIẢ LẬP (MOCK) ---
    if (email && password) {
      localStorage.setItem('token', 'day_la_token_gia_mao_de_test_frontend');
      alert('Đăng nhập giả lập thành công!');
      navigate('/');
    } else {
      alert('Vui lòng nhập email và mật khẩu!');
    }
    // ---------------------------

    /* CODE THẬT (MỞ RA KHI BE LÀM XONG):
    try {
      const res = await axios.post('https://kaban-api-backend-ro81.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Sai thông tin đăng nhập');
    }
    */
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '40px 30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)' }}>
        
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '32px',          
          fontWeight: '900',         
          marginBottom: '30px',      
          background: 'linear-gradient(90deg, #10b981, #059669)', // Gradient Xanh Ngọc
          WebkitBackgroundClip: 'text',       
          WebkitTextFillColor: 'transparent', 
          textTransform: 'uppercase',         
          letterSpacing: '1px'                
        }}>
          Đăng Nhập
        </h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="email" 
            placeholder="Ví dụ: Someone@gmail.com" 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              e.target.setCustomValidity(''); 
            }} 
            onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập đúng định dạng email có chứa ký tự @')}
            required 
            style={{ 
              padding: '12px 15px', 
              fontSize: '16px', 
              border: '1.5px solid #d1d5db', 
              borderRadius: '8px',
              outline: 'none'
            }}
          />

          <input 
            type="password" 
            placeholder="Mật khẩu (Ví dụ: matkhau123)" 
            value={password} 
            onChange={(e) => {
              setPassword(e.target.value);
              e.target.setCustomValidity(''); 
            }} 
            onInvalid={(e) => e.target.setCustomValidity('Vui lòng không để trống mật khẩu')}
            required 
            style={{ 
              padding: '12px 15px', 
              fontSize: '16px', 
              border: '1.5px solid #d1d5db', 
              borderRadius: '8px',
              outline: 'none'
            }}
          />

          <button type="submit" style={{ 
            padding: '12px', 
            backgroundColor: '#10b981', // Nút màu xanh ngọc
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '16px', 
            fontWeight: 'bold',
            borderRadius: '8px',
            marginTop: '10px',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
          }}>
            ĐĂNG NHẬP
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '25px', color: '#6b7280', fontSize: '15px' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký tại đây</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;