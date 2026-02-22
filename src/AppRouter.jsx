import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DesignApp from './App';

/**
 * 路由：落地页 -> 设计工具
 * /         → 落地页（项目背景、场地现状、假设、操作指南）
 * /design   → 设计界面（原单页工具）
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/design" element={<DesignApp />} />
      </Routes>
    </BrowserRouter>
  );
}
