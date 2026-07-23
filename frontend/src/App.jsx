import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ScreenshotScanner from './pages/ScreenshotScanner'
import URLScanner from './pages/URLScanner'
import EmailScanner from './pages/EmailScanner'
import QRScanner from './pages/QRScanner'
import History from './pages/History'
import AIAssistant from './pages/AIAssistant'
import Result from './pages/Result'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/screenshot" element={<ScreenshotScanner />} />
      <Route path="/url" element={<URLScanner />} />
      <Route path="/email" element={<EmailScanner />} />
      <Route path="/qr" element={<QRScanner />} />
      <Route path="/history" element={<History />} />
      <Route path="/assistant" element={<AIAssistant />} />
      <Route path="/result" element={<Result />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
