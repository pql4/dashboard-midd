import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import ServersDashboard from "./ServersDashboard";
import CommandsDashboard from "./CommandsDashboard";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("servers");

  useEffect(() => {
    // Determinar aba ativa baseada na URL
    if (location.pathname === "/" || location.pathname === "/servers") {
      setActiveTab("servers");
    } else if (location.pathname === "/commands") {
      setActiveTab("commands");
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "servers") {
      navigate("/servers");
    } else if (tab === "commands") {
      navigate("/commands");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header com navegação */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Navegação por abas */}
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => handleTabChange("servers")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "servers"
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Lista Servidores
                </button>
                <button
                  onClick={() => handleTabChange("commands")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "commands"
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Comandos
                </button>
              </nav>
            </div>

            {/* Título centralizado */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-xl font-bold">Dashboard Middleware</h1>
            </div>

            {/* Toggle de tema */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "servers" && <ServersDashboard />}
        {activeTab === "commands" && <CommandsDashboard />}
      </main>
    </div>
  );
};

export default MainLayout; 