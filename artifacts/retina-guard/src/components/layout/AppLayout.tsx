import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Menu,
  X,
  LogOut,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor"] },
  { path: "/upload", label: "Upload & Analyze", icon: UploadCloud, roles: ["admin", "doctor"] },
  { path: "/patients", label: "Patient History", icon: Users, roles: ["admin", "doctor"] },
  { path: "/review", label: "Doctor Review", icon: ClipboardCheck, roles: ["doctor"] },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out border-r border-sidebar-border shadow-2xl md:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center gap-3">
          <img 
            src={`${import.meta.env.BASE_URL}images/logo-icon.png`} 
            alt="RetinaGuard AI" 
            className="w-8 h-8 object-contain"
            onError={(e) => { e.currentTarget.style.display='none'; }}
          />
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary-foreground to-teal-200 bg-clip-text text-transparent">
            RetinaGuard
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/20 text-primary-foreground shadow-inner shadow-primary/10 border border-primary/20" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110 text-teal-400" : "group-hover:text-teal-400")} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-teal-400 border border-primary/30">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.username}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors rounded-xl font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center px-4 md:px-8 justify-between shrink-0 z-10 sticky top-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
              Secure Medical Environment
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
