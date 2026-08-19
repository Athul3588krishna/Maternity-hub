import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Loader2, Star } from "lucide-react";
import { RatingStars } from "../components/RatingStars";
import { BookingModal } from "../components/BookingModal";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const mockFallbackCenter = {
  _id: "1",
  centerName: "Blossom Maternity Center",
  rating: 4.9,
  reviewsCount: 1,
  description: "State-of-the-art maternity hospital specializing in natural water birth suites, painless labor care, level III NICU, and luxurious postnatal confinement suites.",
  address: "450 Healthcare Ave, Suite 200",
  location: "San Francisco, CA",
  phone: "+1 (415) 555-0192",
  email: "contact@blossommaternity.care",
  services: [
    { _id: "s1", serviceName: "Postnatal Lactation & Newborn Nursing", price: 3500, duration: "60 mins", description: "Certified lactation nurse consultation, infant attachment guidance." },
    { _id: "s2", serviceName: "Postpartum Recovery & Wellness Care", price: 5000, duration: "90 mins", description: "Physical recovery assistance, mental wellness check, and nutrition plan." },
    { _id: "s3", serviceName: "Prenatal Health & Sonography Package", price: 2500, duration: "45 mins", description: "Full fetal anatomy scan, maternal health assessment, and ultrasound recording." },
    { _id: "s4", serviceName: "Luxury Water Birth Delivery Suite", price: 45000, duration: "24 Hours Care", description: "Private birthing tub, personal midwife, obstetrician on standby, and care kit." }
  ],
  reviews: [
    { _id: "r1", user: { name: "Emily Watson" }, rating: 5, comment: "The birth suite was extraordinarily peaceful and the nurses were so compassionate!", createdAt: new Date().toISOString() }
  ]
};

const CenterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCenterDetails();
  }, [id]);

  const fetchCenterDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/centers/${id}`);
      setCenter(res.data);
    } catch (error) {
      console.error("Error loading center details:", error);
      setCenter(mockFallbackCenter);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to write a review.");
      navigate("/login");
      return;
    }

    const targetCenterId = center?._id || id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(targetCenterId);
    if (!isValidObjectId) {
      setReviewMsg("Reviews can only be submitted for registered database centers.");
      return;
    }

    setSubmittingReview(true);
    setReviewMsg("");
    try {
      await api.post("/reviews", {
        centerId: targetCenterId,
        rating: Number(rating),
        comment
      });
      setReviewMsg("Review submitted successfully!");
      setComment("");
      fetchCenterDetails();
    } catch (error) {
      setReviewMsg(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-3" /> Loading center profile...
      </div>
    );
  }

  const centerData = center || mockFallbackCenter;
  const services = centerData.services || [];
  const reviews = centerData.reviews || [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-primary-100 mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{centerData.centerName || centerData.name}</h1>
          <div className="mb-6">
            <RatingStars rating={centerData.rating || 4.9} showCount={true} totalReviews={centerData.reviewsCount || reviews.length} />
          </div>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-3xl">{centerData.description}</p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 text-sm text-slate-600 border-t border-slate-100 pt-6 mt-6">
            <div className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary-500" /> {centerData.address}, {centerData.location}</div>
            <div className="flex items-center"><Phone className="w-5 h-5 mr-2 text-primary-500" /> {centerData.phone}</div>
            <div className="flex items-center"><Mail className="w-5 h-5 mr-2 text-primary-500" /> {centerData.email}</div>
          </div>
        </div>

        {/* Services List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Maternity & Postnatal Services</h2>
          {services.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={service._id || index} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100 hover:border-primary-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-900 pr-4">{service.serviceName || service.name}</h3>
                      <div className="text-primary-600 font-bold whitespace-nowrap">₹{Number(service.price).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-sm font-medium text-slate-500 mb-3">{service.duration || '60 mins'}</div>
                    <p className="text-slate-600 text-sm mb-6">{service.description || service.desc}</p>
                  </div>
                  <button onClick={() => handleBook(service)} className="btn-primary w-full mt-auto">
                    Book Appointment
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-100">
              No services currently listed for this maternity center.
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-primary-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Patient Reviews</h2>
          
          {/* Write Review Form */}
          <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Write a patient review</h3>
            {reviewMsg && (
              <div className="mb-4 text-sm font-medium p-3 rounded-lg bg-white border border-primary-200 text-primary-700">
                {reviewMsg}
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                  className="input-field max-w-xs"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                <textarea 
                  rows="3" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  placeholder="Share your experience at this center..." 
                  className="input-field resize-none"
                ></textarea>
              </div>
              <button type="submit" disabled={submittingReview} className="btn-secondary">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
          
          {/* Review Items */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev, idx) => (
                <div key={rev._id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900">{rev.user?.name || "Verified Patient"}</span>
                    <RatingStars rating={rev.rating} />
                  </div>
                  <p className="text-slate-600 text-sm">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No reviews yet. Be the first patient to share your experience.
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <BookingModal 
          center={centerData} 
          service={selectedService} 
          onClose={() => setShowBookingModal(false)} 
        />
      )}
    </div>
  );
};

export default CenterDetails;
