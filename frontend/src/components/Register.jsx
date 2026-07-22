import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post('https://kaban-api-backend-ro81.onrender.com/api/auth/register', { name, email, password });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi đăng ký. Vui lòng thử lại.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '40px 30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)' }}>
        
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '32px',          
          fontWeight: '900',         
          marginBottom: '30px',      
          background: 'linear-gradient(90deg, #10b981, #059669)', 
          WebkitBackgroundClip: 'text',      
          WebkitTextFillColor: 'transparent', 
          textTransform: 'uppercase',        
          letterSpacing: '1px'               
        }}>
          ĐĂNG KÝ
        </h2>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Ô nhập Họ và tên */}
          <input 
            type="text" 
            placeholder="Họ và tên (Ví dụ: Nguyễn Văn A)" 
            value={name} 
            onChange={(e) => {
              setName(e.target.value);
              e.target.setCustomValidity(''); 
            }} 
            onInvalid={(e) => e.target.setCustomValidity('Vui lòng không để trống họ và tên')}
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

          {/* Ô NHẬP MẬT KHẨU (Đã tích hợp nút Hiện/Ẩn) */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Mật khẩu (Ví dụ: matkhau123)" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                e.target.setCustomValidity(''); 
              }} 
              onInvalid={(e) => e.target.setCustomValidity('Vui lòng không để trống mật khẩu')}
              required 
              style={{ 
                width: '100%',
                padding: '12px 45px 12px 15px',
                fontSize: '16px', 
                border: '1.5px solid #d1d5db', 
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            
            <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#059669', 
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <button type="submit" style={{ 
            padding: '12px', 
            background: 'linear-gradient(90deg, #10b981, #059669)', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '16px', 
            fontWeight: 'bold',
            borderRadius: '8px',
            marginTop: '10px',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = 0.9}
          onMouseOut={(e) => e.target.style.opacity = 1}
          >
            ĐĂNG KÝ
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '25px', color: '#6b7280', fontSize: '15px' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;