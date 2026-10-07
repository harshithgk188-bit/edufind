import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Bot } from 'lucide-react';

import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { FavoritesProvider } from './context/FavoritesContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ChatBotModal from './components/ai/ChatBotModal';

import Home from './pages/Home';
import DistrictBrowser from './pages/DistrictBrowser';
import CollegeSearch from './pages/CollegeSearch';
import CollegeDetails from './pages/CollegeDetails';
import CollegeCompare from './pages/CollegeCompare';
import Recommendations from './pages/Recommendations';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

export default function App() {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CompareProvider>
          <FavoritesProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
              
              {/* Top Navigation */}
              <Navbar onOpenAiChat={() => setIsAiChatOpen(true)} />

              {/* Main Content Area */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home onOpenAiChat={() => setIsAiChatOpen(true)} />} />
                  <Route path="/districts" element={<DistrictBrowser />} />
                  <Route path="/colleges" element={<CollegeSearch />} />
                  <Route path="/colleges/:id" element={<CollegeDetails />} />
                  <Route path="/compare" element={<CollegeCompare />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/college-admin" element={<CollegeAdminDashboard />} />
                  <Route path="/admin" element={<SuperAdminDashboard />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />

              {/* Persistent Floating AI Assistant Launcher Button */}
              <button
                onClick={() => setIsAiChatOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                title="Ask EduFind AI Assistant"
              >
                <Bot className="w-6 h-6 animate-pulse" />
                <span className="hidden sm:inline text-xs font-bold tracking-wide pr-1">Ask AI</span>
              </button>

              {/* EduFind AI Assistant Modal */}
              <ChatBotModal
                isOpen={isAiChatOpen}
                onClose={() => setIsAiChatOpen(false)}
              />

            </div>
          </FavoritesProvider>
        </CompareProvider>
      </AuthProvider>
    </Router>
  );
}
