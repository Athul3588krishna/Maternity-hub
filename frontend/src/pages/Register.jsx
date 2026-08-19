import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Register = () => {
  const [tab, setTab] = useState("Patient");
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", password: "", centerName: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isProvider = tab === "Center Provider";
      const role = isProvider ? "provider" : "user";
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
        ...(isProvider && { centerName: formData.centerName })
      };
      
      // Call the API we scaffolded earlier
      const res = await api.post("/auth/register", payload);
      
      alert("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-primary-50 flex items-center justify-center">
       <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-primary-100">
         <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Create an account</h2>
         <p className="text-center text-slate-500 mb-8">
           Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
         </p>
         
         <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
           <button 
             type="button"
             onClick={() => setTab("Patient")} 
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'Patient' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
           >
             Patient
           </button>
           <button 
             type="button"
             onClick={() => setTab("Center Provider")} 
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'Center Provider' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
           >
             Center Provider
           </button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
           {tab === "Center Provider" && (
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Center Name</label>
               <input name="centerName" onChange={handleChange} type="text" required placeholder="Enter center name" className="input-field bg-slate-50" />
             </div>
           )}
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
             <input name="name" onChange={handleChange} type="text" required placeholder="Enter your full name" className="input-field bg-slate-50" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
             <input name="phone" onChange={handleChange} type="tel" required placeholder="Enter your phone number" className="input-field bg-slate-50" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
             <input name="email" onChange={handleChange} type="email" required placeholder="Enter your email address" className="input-field bg-slate-50" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
             <input name="password" onChange={handleChange} type="password" required placeholder="Create a password" className="input-field bg-slate-50" />
           </div>
           <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-lg mt-4">
             {loading ? "Creating..." : "Create account"}
           </button>
         </form>
       </div>
     </div>
  );
};

export default Register;
