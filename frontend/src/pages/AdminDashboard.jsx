import { useState, useEffect } from "react";
import { Building, Check, X, ShieldAlert, Users, Calendar, Loader2 } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";

const AdminDashboard = () => {
  const [centers, setCenters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("centers");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [centersRes, bookingsRes] = await Promise.all([
        api.get("/centers/admin/all"),
        api.get("/bookings/all")
      ]);
      setCenters(centersRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (centerId, newStatus) => {
    setActionLoading(centerId);
    try {
      await api.put(`/centers/${centerId}/status`, { status: newStatus });
      setCenters(centers.map(c => c._id === centerId ? { ...c, status: newStatus } : c));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update center status");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCenters = centers.filter(c => c.status === "Pending");
  const approvedCenters = centers.filter(c => c.status === "Approved");

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Control Center</h1>
          </div>
          <p className="text-slate-600">Review maternity center applications and monitor global bookings.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Total Centers</span>
              <Building className="w-5 h-5 text-primary-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{centers.length}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-700">Pending Review</span>
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700">{pendingCenters.length}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Approved Centers</span>
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{approvedCenters.length}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Total Bookings</span>
              <Calendar className="w-5 h-5 text-secondary-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{bookings.length}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab("centers")}
            className={`pb-4 px-6 font-bold text-base border-b-2 transition-colors ${activeTab === 'centers' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Maternity Centers ({centers.length})
          </button>
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 px-6 font-bold text-base border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Global Bookings ({bookings.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-3" /> Fetching admin data...
          </div>
        ) : activeTab === "centers" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Center Applications & Directory</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Center Name</th>
                    <th className="py-4 px-6">Owner / Contact</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {centers.map((center) => (
                    <tr key={center._id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{center.centerName}</div>
                        <div className="text-xs text-slate-500">{center.description?.slice(0, 50)}...</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-900 font-medium">{center.ownerName}</div>
                        <div className="text-xs text-slate-500">{center.email} • {center.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{center.location}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={center.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {center.status === "Pending" ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleStatusUpdate(center._id, "Approved")}
                              disabled={actionLoading === center._id}
                              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(center._id, "Rejected")}
                              disabled={actionLoading === center._id}
                              className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors flex items-center"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Reject
                            </button>
                          </div>
                        ) : center.status === "Approved" ? (
                          <button 
                            onClick={() => handleStatusUpdate(center._id, "Rejected")}
                            disabled={actionLoading === center._id}
                            className="text-xs text-rose-600 font-medium hover:underline"
                          >
                            Revoke Approval
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(center._id, "Approved")}
                            disabled={actionLoading === center._id}
                            className="text-xs text-emerald-600 font-medium hover:underline"
                          >
                            Re-Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">All Platform Appointments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Center & Service</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60">
                      <td className="py-4 px-6 font-bold text-slate-900">{b.user?.name || "Patient"}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{b.center?.centerName}</div>
                        <div className="text-xs text-slate-500">{b.service?.serviceName}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(b.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ₹{Number(b.service?.price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={b.bookingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
