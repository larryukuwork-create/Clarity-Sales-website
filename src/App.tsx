import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ClientIntake from "./pages/ClientIntake";
import AdminLogin from "./pages/AdminLogin";
import OutreachDashboard from "./pages/OutreachDashboard";
import ProjectStatus from "./pages/ProjectStatus";
import ProjectFeedback from "./pages/ProjectFeedback";
import WorkPage from "./pages/WorkPage";
import ProcessPage from "./pages/ProcessPage";
import WebsiteCheck from "./pages/WebsiteCheck";

// Keep existing demo/proposal imports
import DemoSitesContainer from "./components/DemoSitesContainer";
import SwimmingSchoolQuote from "./components/SwimmingSchoolQuote";
import StaticBusinessQuote from "./components/StaticBusinessQuote";
import SEOManager from "./components/SEOManager";
import NoIndex from "./components/NoIndex";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Home />} />
        <Route path="/packages" element={<Home />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/free-website-check" element={<WebsiteCheck />} />
        <Route path="/contact" element={<Home />} />

        {/* Private Ops */}
        <Route path="/client-intake" element={<ClientIntake />} />
        <Route path="/project-status/:secureToken" element={<><NoIndex /><ProjectStatus /></>} />
        <Route path="/project-feedback/:secureToken" element={<><NoIndex /><ProjectFeedback /></>} />
        <Route path="/admin-login" element={<><NoIndex /><AdminLogin /></>} />
        <Route path="/outreach" element={<><NoIndex /><OutreachDashboard /></>} />
        <Route path="/outreach/admin" element={<><NoIndex /><OutreachDashboard /></>} />

        {/* Demo Sites Sandbox */}
        <Route path="/demo" element={<><SEOManager currentPath="/demo" /><DemoSitesContainer currentPath="/demo" /></>} />
        <Route path="/site/:id" element={<><SEOManager currentPath="/site" /><DemoSitesContainer currentPath="/site" /></>} />

        {/* Industry Specific Proposals - Public but Unlinked */}
        <Route path="/swimming-school-quote" element={<><SEOManager currentPath="/swimming-school-quote" /><SwimmingSchoolQuote /></>} />
        <Route path="/swimming-school-quote/demo" element={<><SEOManager currentPath="/swimming-school-quote/demo" /><DemoSitesContainer currentPath="/swimming-school-quote/demo" /></>} />
        
        <Route path="/business-quote" element={<><SEOManager currentPath="/business-quote" /><StaticBusinessQuote /></>} />
        <Route path="/business-quote/demo" element={<><SEOManager currentPath="/business-quote/demo" /><DemoSitesContainer currentPath="/business-quote/demo" /></>} />
        
        <Route path="/cheap-business-quote" element={<><SEOManager currentPath="/cheap-business-quote" /><StaticBusinessQuote /></>} />
        <Route path="/cheap-business-quote/demo" element={<><SEOManager currentPath="/cheap-business-quote/demo" /><DemoSitesContainer currentPath="/cheap-business-quote/demo" /></>} />
        
        <Route path="/portfolio-quote" element={<><SEOManager currentPath="/portfolio-quote" /><StaticBusinessQuote /></>} />
        <Route path="/portfolio-quote/demo" element={<><SEOManager currentPath="/portfolio-quote/demo" /><DemoSitesContainer currentPath="/portfolio-quote/demo" /></>} />
        
        <Route path="/portfolio-website" element={<><SEOManager currentPath="/portfolio-website" /><StaticBusinessQuote /></>} />
        <Route path="/portfolio-website/demo" element={<><SEOManager currentPath="/portfolio-website/demo" /><DemoSitesContainer currentPath="/portfolio-website/demo" /></>} />
        
        <Route path="/consultant-quote" element={<><SEOManager currentPath="/consultant-quote" /><StaticBusinessQuote /></>} />
        <Route path="/consultant-quote/demo" element={<><SEOManager currentPath="/consultant-quote/demo" /><DemoSitesContainer currentPath="/consultant-quote/demo" /></>} />
        
        <Route path="/consultant-website" element={<><SEOManager currentPath="/consultant-website" /><StaticBusinessQuote /></>} />
        <Route path="/consultant-website/demo" element={<><SEOManager currentPath="/consultant-website/demo" /><DemoSitesContainer currentPath="/consultant-website/demo" /></>} />
        
        <Route path="/trades-quote" element={<><SEOManager currentPath="/trades-quote" /><StaticBusinessQuote /></>} />
        <Route path="/trades-quote/demo" element={<><SEOManager currentPath="/trades-quote/demo" /><DemoSitesContainer currentPath="/trades-quote/demo" /></>} />
        
        <Route path="/trades-website" element={<><SEOManager currentPath="/trades-website" /><StaticBusinessQuote /></>} />
        <Route path="/trades-website/demo" element={<><SEOManager currentPath="/trades-website/demo" /><DemoSitesContainer currentPath="/trades-website/demo" /></>} />
        
        <Route path="/restaurant-quote" element={<><SEOManager currentPath="/restaurant-quote" /><StaticBusinessQuote /></>} />
        <Route path="/restaurant-quote/demo" element={<><SEOManager currentPath="/restaurant-quote/demo" /><DemoSitesContainer currentPath="/restaurant-quote/demo" /></>} />
        
        <Route path="/restaurant-website" element={<><SEOManager currentPath="/restaurant-website" /><StaticBusinessQuote /></>} />
        <Route path="/restaurant-website/demo" element={<><SEOManager currentPath="/restaurant-website/demo" /><DemoSitesContainer currentPath="/restaurant-website/demo" /></>} />
        
        <Route path="/local-quote" element={<><SEOManager currentPath="/local-quote" /><StaticBusinessQuote /></>} />
        <Route path="/local-quote/demo" element={<><SEOManager currentPath="/local-quote/demo" /><DemoSitesContainer currentPath="/local-quote/demo" /></>} />
        
        <Route path="/local-business-quote" element={<><SEOManager currentPath="/local-business-quote" /><StaticBusinessQuote /></>} />
        <Route path="/local-business-quote/demo" element={<><SEOManager currentPath="/local-business-quote/demo" /><DemoSitesContainer currentPath="/local-business-quote/demo" /></>} />
        
        <Route path="/static-business-quote" element={<><SEOManager currentPath="/static-business-quote" /><StaticBusinessQuote /></>} />
        <Route path="/static-business-quote/demo" element={<><SEOManager currentPath="/static-business-quote/demo" /><DemoSitesContainer currentPath="/static-business-quote/demo" /></>} id="static-business-quote-demo" />
      </Routes>
    </>
  );
}
