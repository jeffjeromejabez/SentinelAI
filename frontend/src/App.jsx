import Navbar from './components/Navbar'
import UploadSection from './components/UploadSection'
import FeatureCards from './components/FeatureCards'
import CyberDecorations from './components/CyberDecorations'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <CyberDecorations />
        <div className="glass-container">
          <UploadSection />
          <FeatureCards />
        </div>
      </main>
    </div>
  )
}
