import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPatients, useAnalyzeScan } from "@workspace/api-client-react";
import { UploadCloud, Image as ImageIcon, AlertCircle, ScanLine, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export default function UploadAnalyze() {
  const [, setLocation] = useLocation();
  const { data: patients, isLoading: patientsLoading } = useGetPatients();
  const analyzeMutation = useAnalyzeScan();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(f);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file || !preview) {
      setError("Please select a retinal image to analyze.");
      return;
    }
    if (!patientId) {
      setError("Please select a patient.");
      return;
    }

    setError("");
    setIsScanning(true);

    try {
      // Fake a slight delay for animation, then run mutation
      await new Promise(res => setTimeout(res, 2500));
      
      const scan = await analyzeMutation.mutateAsync({
        data: {
          patientId: parseInt(patientId, 10),
          imageData: preview // Sending base64
        }
      });
      
      console.log("API Response:", scan);
      
      setLocation(`/scans/${scan.id}`);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
      setIsScanning(false);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
  };

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-8">
        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl shadow-primary/20 bg-black">
          {preview && <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-50 grayscale" />}
          <div className="absolute inset-0 border-[8px] border-primary rounded-full animate-pulse-ring" />
          <div className="absolute left-0 w-full h-2 bg-teal-400 shadow-[0_0_20px_rgba(45,212,191,1)] animate-scan-line" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine className="w-16 h-16 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground animate-pulse">Running AI Model...</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Analyzing retinal microaneurysms, hemorrhages, and hard exudates using deep learning ensemble.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground">Upload & Analyze</h1>
        <p className="text-muted-foreground mt-1">Upload a fundus image for rapid DR screening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-semibold text-lg mb-4">1. Select Patient</h3>
            <select 
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              disabled={patientsLoading}
            >
              <option value="">{patientsLoading ? "Loading patients..." : "-- Choose a patient --"}</option>
              {patients?.map(p => (
                <option key={p.id} value={p.id}>{p.name} (DOB: {new Date().getFullYear() - p.age})</option>
              ))}
            </select>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-semibold text-lg mb-4">2. Upload Fundus Image</h3>
            <div 
              {...getRootProps()} 
              className={cn(
                "border-3 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                preview ? "p-4" : ""
              )}
            >
              <input {...getInputProps()} />
              
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    className="relative rounded-xl overflow-hidden group"
                  >
                    <img src={preview} alt="Preview" className="w-full h-auto max-h-80 object-contain bg-black/5" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={clearFile} className="bg-destructive text-white p-3 rounded-full hover:scale-110 transition-transform">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">Drag & drop image here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse from device</p>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-4">
                      <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4"/> JPEG, PNG</span>
                      <span>Max 10MB</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Ready to Analyze</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-bold text-foreground">{patientId ? patients?.find(p => p.id.toString() === patientId)?.name : 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Image:</span>
                <span className="font-bold text-foreground">{file ? file.name : 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-bold text-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || !patientId}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <ScanLine className="w-6 h-6" />
              Analyze Scan
            </button>
            
            {/* Demo Helper */}
            {!file && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                 <p className="text-xs text-blue-800 font-medium">Demo Tip: Use the placeholder retina image.</p>
                 <button 
                  onClick={() => {
                    // Pre-fill with demo image
                    setPreview(`${import.meta.env.BASE_URL}images/retina-demo.png`);
                    setFile(new File([""], "retina-demo.png", { type: "image/png" }));
                    if (patients && patients.length > 0) setPatientId(patients[0].id.toString());
                  }}
                  className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-1.5 rounded-lg font-bold transition-colors w-full"
                 >
                   Load Demo Image
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
