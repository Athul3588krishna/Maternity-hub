import { useState, useContext } from "react";
import { X, Calendar, CreditCard, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export const BookingModal = ({ center, service, onClose }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookingDate, setBookingDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to complete your appointment booking.");
      onClose();
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.post("/bookings", {
        centerId: center._id || center.id,
        serviceId: service._id || service.id,
        bookingDate,
        paymentMethod
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate("/my-bookings");
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to submit booking appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-primary-100"
        >
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Book Appointment</h2>
            <p className="text-slate-600 text-sm mb-6">
              Reserve service at <span className="font-semibold text-slate-900">{center?.centerName || center?.name}</span>.
            </p>
            
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm mb-4">
                {errorMsg}
              </div>
            )}

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl text-center font-medium my-4">
                🎉 Appointment booked successfully! Directing you to your bookings dashboard...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                  <h4 className="font-bold text-slate-900 text-base">{service?.serviceName || service?.name}</h4>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="font-semibold text-primary-600">₹{Number(service?.price || 0).toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 font-medium">{service?.duration || '60 mins'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-primary-500" /> Select Appointment Date & Time
                  </label>
                  <input 
                    type="datetime-local" 
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={(() => {
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = String(now.getMonth() + 1).padStart(2, '0');
                      const day = String(now.getDate()).padStart(2, '0');
                      const hours = String(now.getHours()).padStart(2, '0');
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      return `${year}-${month}-${day}T${hours}:${minutes}`;
                    })()}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                    <CreditCard className="w-4 h-4 mr-1.5 text-primary-500" /> Payment Option
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field"
                  >
                    <option value="Online">Online Payment / UPI / Card</option>
                    <option value="PayAtHospital">Pay at Maternity Center</option>
                  </select>
                </div>
                
                <button type="submit" disabled={submitting} className="btn-primary w-full h-12 text-base mt-2 flex items-center justify-center">
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Booking Appointment...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
