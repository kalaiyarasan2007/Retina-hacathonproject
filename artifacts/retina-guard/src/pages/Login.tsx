import React, { useState } from "react";
import { useAuth, Role } from "@/lib/auth";
import { Stethoscope, ShieldCheck, ArrowRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      let role: Role = null;
      if (username === "admin" && password === "admin123") role = "admin";
      if (username === "doctor" && password === "doc123") role = "doctor";

      if (role) {
        login(username, role);
      } else {
        setError("Invalid credentials. Try admin/admin123 or doctor/doc123.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-background w-full">
      {/* Left Branding Side */}
      <div className="hidden lg:flex w-1/2 bg-sidebar relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
            alt="Medical AI" 
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-transparent to-transparent" />
        </div>
        
        <div className="z-10 flex items-center gap-4">
          <img 
            src={`${import.meta.env.BASE_URL}images/logo-icon.png`} 
            alt="Logo" 
            className="w-12 h-12"
          />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">RetinaGuard AI</h1>
        </div>

        <div className="z-10 mt-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" /> FDA Compliant Sandbox
          </div>
          <h2 className="text-5xl font-display font-bold text-white leading-tight mb-6">
            Early Detection.<br/>
            <span className="text-teal-400">Preserving Vision.</span>
          </h2>
          <p className="text-sidebar-foreground/70 text-lg max-w-md">
            Advanced AI models for rapid screening of Diabetic Retinopathy in rural and remote clinical environments.
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex justify-center mb-6">
               <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} className="w-16 h-16 bg-sidebar rounded-2xl p-2" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access patient scans and analytics.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => { setUsername("doctor"); setPassword("doc123"); }}
              className={cn(
                "p-4 rounded-2xl border-2 text-left transition-all",
                username === "doctor" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <Stethoscope className={cn("w-6 h-6 mb-2", username === "doctor" ? "text-primary" : "text-muted-foreground")} />
              <div className="font-bold text-foreground">Doctor</div>
              <div className="text-xs text-muted-foreground">Review scans</div>
            </button>
            <button 
              type="button"
              onClick={() => { setUsername("admin"); setPassword("admin123"); }}
              className={cn(
                "p-4 rounded-2xl border-2 text-left transition-all",
                username === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <Eye className={cn("w-6 h-6 mb-2", username === "admin" ? "text-primary" : "text-muted-foreground")} />
              <div className="font-bold text-foreground">Admin</div>
              <div className="text-xs text-muted-foreground">Manage system</div>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Username</label>
                <input 
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-foreground">Password</label>
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? "Authenticating..." : "Secure Login"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By logging in, you agree to HIPAA compliance policies.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
