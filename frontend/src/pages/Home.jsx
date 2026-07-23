import Navbar from '../components/Navbar'
import CyberDecorations from '../components/CyberDecorations'
import HeroSection from '../components/home/HeroSection'
import StatsSection from '../components/home/StatsSection'
import ModulesSection from '../components/home/ModulesSection'
import WorkflowSection from '../components/home/WorkflowSection'
import WhyUsSection from '../components/home/WhyUsSection'
import CyberDashboardSection from '../components/home/CyberDashboardSection'
import CtaSection from '../components/home/CtaSection'
import FooterSection from '../components/home/FooterSection'
import '../components/home/HomeSections.css'

export default function Home() {
  return (
    <div className="app">
      <Navbar />
      <CyberDecorations />
      <main className="home-container">
        <HeroSection />
        <StatsSection />
        <ModulesSection />
        <WorkflowSection />
        <WhyUsSection />
        <CyberDashboardSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  )
}
