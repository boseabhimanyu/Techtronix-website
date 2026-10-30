import CoverageSection from "./components/home/CoverageSection";
import HeroSection from "./components/home/HeroSection";
import LinuxSpecializationSection from "./components/home/LinuxSpecializationSection";
import ServicesSection from "./components/home/ServicesSection";
import WorkflowSection from "./components/home/WorkflowSection";

export default function HomePage() {
  return (
    <main className="space-y-4">
      <HeroSection />
      <ServicesSection />
      <WorkflowSection />
      <LinuxSpecializationSection />
      <CoverageSection />
    </main>
  );
}