import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { RatingStars } from "../components/RatingStars";
import { StatusBadge } from "../components/StatusBadge";
import { motion } from "framer-motion";
import { api } from "../services/api";

const mockCenters = [
  {
    _id: "1",
    centerName: "Blossom Maternity Center",
    location: "San Francisco, CA",
    distance: "5.2 km away",
    description: "Luxury natural birth suites, 24/7 obstetricians, water birth tubs, and postpartum confinement care.",
    rating: 4.9,
    status: "Approved"
  },
  {
    _id: "2",
    centerName: "St. Jude Postnatal Care",
    location: "Chicago, IL",
    distance: "8.5 km away",
    description: "Level III NICU, comprehensive high-risk pregnancy management, fetal cardiology & ultrasound.",
    rating: 4.8,
    status: "Approved"
  },
  {
    _id: "3",
    centerName: "Serenity Maternity Center",
    location: "Austin, TX",
    distance: "12.1 km away",
    description: "Postpartum nursing retreat, lactation consultants, maternal mental wellness counseling, newborn nutrition.",
    rating: 5.0,
    status: "Approved"
  },
  {
    _id: "4",
    centerName: "Grace Postnatal Care",
    location: "New York, NY",
    distance: "3.4 km away",
    description: "Comprehensive prenatal diagnostics, painless epidural labor suites, and 24/7 emergency OB/GYN response.",
    rating: 4.7,
    status: "Approved"
  }
];

const CenterList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      try {
        const res = await api.get("/centers", {
          params: {
            search: searchTerm,
            location: locationFilter
          }
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCenters(res.data);
        } else {
          // Fallback filtering if backend returns empty dataset initially
          const filtered = mockCenters.filter(c => {
            const matchesSearch = c.centerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  c.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLoc = locationFilter === "All Locations" || c.location === locationFilter;
            return matchesSearch && matchesLoc;
          });
          setCenters(filtered);
        }
      } catch (error) {
        console.error("Error fetching centers from API:", error);
        setCenters(mockCenters);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCenters();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, locationFilter]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Maternity Centers Directory</h1>
          <p className="text-slate-600 text-lg">Browse certified birthing suites and specialized maternity hospitals.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 rounded-2xl mb-10 flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search by center name, services..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 h-12"
            />
          </div>
          <div className="md:w-64 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input-field pl-12 h-12 appearance-none"
            >
              <option>All Locations</option>
              <option>San Francisco, CA</option>
              <option>Chicago, IL</option>
              <option>Austin, TX</option>
              <option>New York, NY</option>
              <option>Los Angeles, CA</option>
              <option>Seattle, WA</option>
            </select>
          </div>
        </div>

        {/* Center List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mr-3" /> Loading maternity centers...
          </div>
        ) : centers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {centers.map((center, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={center._id || index} 
                className="bg-white p-6 rounded-2xl shadow-md border border-primary-100 hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{center.centerName || center.name}</h2>
                      <div className="flex items-center text-slate-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        {center.location} {center.distance && <span className="mx-2">• {center.distance}</span>}
                      </div>
                    </div>
                    <StatusBadge status={center.status || "Approved"} />
                  </div>
                  
                  <div className="mb-4">
                    <RatingStars rating={center.rating || 4.8} showCount={true} totalReviews={center.reviewsCount || 0} />
                  </div>
                  
                  <p className="text-slate-600 mb-6 flex-grow">{center.description}</p>
                </div>

                <div className="mt-auto">
                  <Link to={`/centers/${center._id}`} className="btn-secondary w-full text-center block">
                    View Details & Book
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No maternity centers found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterList;
