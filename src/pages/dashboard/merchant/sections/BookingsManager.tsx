import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Calendar, Clock, User, CheckCircle2, XCircle, 
  AlertCircle, ChevronRight, Phone, MessageSquare,
  Filter, Search, MoreHorizontal, Loader2, Scissors
} from 'lucide-react';

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
}

const BookingsManager = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) fetchBookings();
  }, [user, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('bookings')
        .select(`
          id, 
          customer_name, 
          customer_phone, 
          booking_date, 
          booking_time, 
          status, 
          total_price,
          services (name)
        `)
        .eq('merchant_id', user?.id)
        .order('booking_date', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedData = data.map((b: any) => ({
        ...b,
        service_name: b.services?.name || 'Unspecified Service'
      }));

      setBookings(formattedData);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchBookings(); 
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="ltr">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Appointment Manager</h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Real-time scheduling & customer flow</p>
        </div>
        
        <div className="flex flex-wrap bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          {['all', 'pending', 'confirmed', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Feed */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Syncing Calendar...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-50 rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
             <Calendar size={64} className="mx-auto text-gray-200 mb-6" />
             <h3 className="text-xl font-black text-gray-900">No bookings found</h3>
             <p className="text-gray-400 font-bold mt-2 text-sm max-w-xs mx-auto">When clients book through your profile, their appointments will appear here.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Identity Section */}
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:rotate-3 ${getStatusStyle(booking.status)}`}>
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{booking.customer_name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1.5 text-indigo-600 font-black text-[9px] uppercase bg-indigo-50 px-3 py-1.5 rounded-lg">
                        <Scissors size={12} strokeWidth={3} /> {booking.service_name}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400 font-bold text-[9px] uppercase bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Phone size={12} /> {booking.customer_phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scheduling Details */}
                <div className="flex items-center gap-10 px-0 lg:px-10 lg:border-x border-gray-50">
                  <div className="text-left min-w-[100px]">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Date</p>
                    <p className="font-black text-gray-900 text-sm">{booking.booking_date}</p>
                  </div>
                  <div className="text-left min-w-[100px]">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Time Slot</p>
                    <div className="flex items-center gap-1.5 font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg text-sm w-fit">
                      <Clock size={14} /> {booking.booking_time}
                    </div>
                  </div>
                </div>

                {/* Management Actions */}
                <div className="flex items-center gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="p-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-90"
                        title="Confirm Booking"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="p-4 bg-gray-50 text-gray-400 rounded-2xl font-black hover:bg-rose-50 hover:text-rose-500 transition-all"
                        title="Cancel Booking"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button 
                      onClick={() => updateStatus(booking.id, 'completed')}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                      Complete Session
                    </button>
                  )}
                  <div className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>

              </div>
              
              {/* Vertical Status Accent */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                booking.status === 'confirmed' ? 'bg-emerald-400' : 
                booking.status === 'pending' ? 'bg-amber-400' : 
                booking.status === 'completed' ? 'bg-blue-400' : 'bg-rose-400'
              }`}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingsManager;