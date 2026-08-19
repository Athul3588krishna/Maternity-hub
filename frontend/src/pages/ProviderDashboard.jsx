import { useState, useEffect, useContext } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, Clock, Building, Loader2 } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const ProviderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [center, setCenter] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  // New service form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60 mins");
  const [submittingService, setSubmittingService] = useState(false);

  useEffect(() => {
    fetchProviderData();
  }, [user]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      if (user?.centerId) {
        const centerRes = await api.get(`/centers/${user.centerId}`);
        setCenter(centerRes.data);
        setServices(centerRes.data.services || []);
        
        const bookingsRes = await api.get(`/bookings/center/${user.centerId}`);
        setBookings(bookingsRes.data || []);
      }
    } catch (error) {
      console.error("Error loading provider details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!user?.centerId) return;

    setSubmittingService(true);
    try {
      const res = await api.post("/services", {
        centerId: user.centerId,
        serviceName,
        description,
        price: Number(price),
        duration
      });
      setServices([...services, res.data]);
      setShowAddModal(false);
      setServiceName("");
      setDescription("");
      setPrice("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create service");
    } finally {
      setSubmittingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setServices(services.filter(s => s._id !== serviceId));
    } catch (error) {
      alert("Failed to delete service");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { bookingStatus: newStatus });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, bookingStatus: newStatus } : b));
    } catch (error) {
      alert("Failed to update appointment status");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-extrabold text-slate-900">Provider Control Dashboard</h1>
          </div>
          <p className="text-slate-600">
            Managing <span className="font-bold text-slate-900">{center?.centerName || "Your Maternity Center"}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 px-6 font-bold text-base border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Patient Appointments ({bookings.length})
          </button>
          <button 
            onClick={() => setActiveTab("services")}
            className={`pb-4 px-6 font-bold text-base border-b-2 transition-colors ${activeTab === 'services' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Clinical Services ({services.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-3" /> Fetching center data...
          </div>
        ) : activeTab === "bookings" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Incoming Patient Bookings</h2>
            </div>

            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4 px-6">Patient Name</th>
                      <th className="py-4 px-6">Service Booked</th>
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/60">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{b.user?.name || "Patient"}</div>
                          <div className="text-xs text-slate-500">{b.user?.phone} • {b.user?.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{b.service?.serviceName}</div>
                          <div className="text-xs text-primary-600 font-bold">₹{Number(b.service?.price || 0).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {new Date(b.bookingDate).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={b.bookingStatus} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {b.bookingStatus === "Pending" ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleUpdateBookingStatus(b._id, "Accepted")}
                                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleUpdateBookingStatus(b._id, "Rejected")}
                                className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors flex items-center"
                              >
                                Reject
                              </button>
                            </div>
                          ) : b.bookingStatus === "Accepted" ? (
                            <button 
                              onClick={() => handleUpdateBookingStatus(b._id, "Completed")}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                            >
                              Mark Completed
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                No patient bookings received yet.
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Offered Clinical & Postnatal Services</h2>
              <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Service
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{s.serviceName}</h3>
                      <button onClick={() => handleDeleteService(s._id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-primary-600 mb-2">₹{Number(s.price).toLocaleString('en-IN')}</div>
                    <div className="text-xs font-medium text-slate-500 mb-3">{s.duration}</div>
                    <p className="text-slate-600 text-sm mb-4">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Service Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Add Maternity Service</h3>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                      <input type="text" required value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="e.g. Prenatal Sonography" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                      <input type="number" required value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 3500" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                      <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60 mins" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea rows="3" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the service details..." className="input-field resize-none" />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                      <button type="submit" disabled={submittingService} className="btn-primary flex-1">Save Service</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
