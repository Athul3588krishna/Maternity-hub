import { Link } from "react-router-dom";
import { HeartPulse, Menu, User, Calendar, ShieldAlert, Building, LogOut } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glass-card bg-white/85 border-b border-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              MaternityHub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-primary-500 font-medium transition-colors">Home</Link>
            <Link to="/centers" className="text-slate-600 hover:text-primary-500 font-medium transition-colors">Centers Directory</Link>

            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-primary-500 font-medium transition-colors flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Admin Dashboard
                  </Link>
                )}
                {(user.role === 'admin' || user.role === 'provider' || user.centerId) && (
                  <Link to="/provider-dashboard" className="text-slate-600 hover:text-primary-500 font-medium transition-colors flex items-center gap-1">
                    <Building className="w-4 h-4 text-primary-500" /> Provider Portal
                  </Link>
                )}
                <Link to="/my-bookings" className="text-slate-600 hover:text-primary-500 font-medium transition-colors flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-secondary-500" /> My Bookings
                </Link>
              </>
            )}

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{user.name}</span>
                  </div>
                  <button onClick={logout} className="btn-secondary text-sm flex items-center gap-1 px-3 py-1.5">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-slate-600 font-medium hover:text-primary-500 text-sm">Sign in</Link>
                  <Link to="/register" className="btn-primary text-sm">Register</Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-primary-500 transition-colors p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 shadow-lg absolute w-full left-0 top-full">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium">Home</Link>
              <Link to="/centers" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium">Centers Directory</Link>
              
              {user && (
                <>
                  <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary-500" /> My Bookings
                  </Link>
                  {(user.role === 'admin' || user.role === 'provider' || user.centerId) && (
                    <Link to="/provider-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary-500" /> Provider Portal
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Admin Dashboard
                    </Link>
                  )}
                </>
              )}

              <hr className="border-slate-100" />
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <User className="w-4 h-4" /> {user.name} ({user.role})
                  </div>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn-secondary w-full text-center">Logout</button>
                </div>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 font-medium">Sign in</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full text-center">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
