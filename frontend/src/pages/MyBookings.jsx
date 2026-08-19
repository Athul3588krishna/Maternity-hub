import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Loader2, ArrowLeft, Building } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data || []);
    } catch (error) {
      console.error("Error loading user bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-primary-50/30">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">My Bookings</h1>
            <p className="text-slate-600">Track and manage your upcoming maternity appointments.</p>
          </div>
          <Link to="/centers" className="btn-primary flex items-center gap-2">
            <Building className="w-4 h-4" /> Browse Centers
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-3" /> Loading your appointments...
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900">{b.center?.centerName || "Maternity Center"}</h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.bookingStatus} />
                      <StatusBadge status={b.paymentStatus || "Paid"} />
                    </div>
                  </div>

                  <p className="text-primary-600 font-semibold text-base mb-3">
                    {b.service?.serviceName || "Maternity Service"}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {new Date(b.bookingDate).toLocaleString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {b.center?.location || b.center?.address || "Center Location"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Total Amount</div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      ₹{Number(b.service?.price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {b.center?._id && (
                    <Link to={`/centers/${b.center._id}`} className="text-primary-600 text-sm font-semibold hover:underline mt-4">
                      View Center Details →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-primary-100">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You haven't booked any maternity or postnatal care services yet. Browse our certified maternity centers to find the best care.
            </p>
            <Link to="/centers" className="btn-primary inline-block">
              Explore Maternity Centers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
