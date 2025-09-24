'use client';
import { useState } from 'react';

export function LoginForm({ handleLogin, password, setPassword }) {
  return (
    <form onSubmit={handleLogin}>
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #ddd',
          borderRadius: '5px',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      />
      
      <button
        type="submit"
        style={{
          width: '100%',
          background: '#667eea',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        دخول
      </button>
    </form>
  );
}