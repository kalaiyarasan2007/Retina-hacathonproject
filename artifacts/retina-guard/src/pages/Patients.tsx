import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetPatients, useCreatePatient, useDeletePatient } from "@workspace/api-client-react";
import { formatMedicalDate } from "@/lib/utils";
import { Search, Plus, User, Activity, AlertCircle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { DeleteButton } from "@/components/DeleteButton";

export default function Patients() {
  const { data: patients, isLoading, refetch } = useGetPatients();
  const createMutation = useCreatePatient();
  const deleteMutation = useDeletePatient();
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = patients?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        data: {
          name: data.name,
          age: parseInt(data.age, 10),
          gender: data.gender,
          diabetesType: data.diabetesType || null,
          contactInfo: data.contactInfo
        }
      });
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Patient Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and review patient histories.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all w-max"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search patients by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Patient ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Age / Gender</th>
                <th className="p-4 font-medium">Diabetes Type</th>
                <th className="p-4 font-medium">Registered</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading patients...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(patient => (
                  <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-sm text-muted-foreground">#PT-{patient.id.toString().padStart(4, '0')}</td>
                    <td className="p-4 font-bold text-foreground">{patient.name}</td>
                    <td className="p-4 text-muted-foreground">{patient.age} yrs • <span className="capitalize">{patient.gender}</span></td>
                    <td className="p-4">
                      {patient.diabetesType ? (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 text-xs font-bold uppercase">
                          {patient.diabetesType}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{formatMedicalDate(patient.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/patients/${patient.id}`} className="text-primary font-semibold hover:underline text-sm flex items-center gap-1">
                          View History <Activity className="w-4 h-4" />
                        </Link>
                        <DeleteButton 
                          onDelete={async () => {
                            await deleteMutation.mutateAsync({ id: patient.id });
                            refetch();
                          }} 
                          title="Delete Patient?"
                          description="This will remove the patient and all associated scans. This action cannot be undone."
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold font-display">Register New Patient</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:bg-muted p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Full Name</label>
                <input {...register("name", { required: true })} className="w-full p-3 rounded-xl border border-input focus:border-primary outline-none" placeholder="e.g. John Doe" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Age</label>
                  <input type="number" {...register("age", { required: true, min: 1, max: 120 })} className="w-full p-3 rounded-xl border border-input focus:border-primary outline-none" placeholder="Yrs" />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Gender</label>
                  <select {...register("gender", { required: true })} className="w-full p-3 rounded-xl border border-input focus:border-primary outline-none bg-background">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Diabetes Type</label>
                <select {...register("diabetesType")} className="w-full p-3 rounded-xl border border-input focus:border-primary outline-none bg-background">
                  <option value="">Unknown / None</option>
                  <option value="type1">Type 1</option>
                  <option value="type2">Type 2</option>
                  <option value="gestational">Gestational</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Contact Info</label>
                <input {...register("contactInfo")} className="w-full p-3 rounded-xl border border-input focus:border-primary outline-none" placeholder="Phone or email" />
              </div>

              {createMutation.isError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4"/> Failed to create patient.
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-border transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-3 rounded-xl font-bold text-primary-foreground bg-primary shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-50">
                  {createMutation.isPending ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
