import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) { console.error(err, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0f172a', color: '#e2e8f0', minHeight: '100vh' }}>
          <h1>页面加载出错</h1>
          <p>请尝试刷新页面（Ctrl+F5）。若仍空白，请按 F12 打开控制台查看错误信息。</p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
