import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Search,
  ChevronRight,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

const BookingsManager = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services (name, price)
      `)
      .eq('merchant_id', user.id)
      .order('start_time', { ascending: true });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user, filter]);

  const updateStatus = async (bookingId: string, newStatus: string, customerId: string) => {
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
    
    if (updateError) return;

    if (newStatus === 'completed' && customerId) {
      const { data: loyaltyCard } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('customer_id', customerId)
        .eq('merchant_id', user?.id)
        .single();

      if (loyaltyCard) {
        await supabase
          .from('loyalty_cards')
          .update({ stamps_count: loyaltyCard.stamps_count + 1, last_updated: new Date() })
          .eq('id', loyaltyCard.id);
      } else {
        await supabase
          .from('loyalty_cards')
          .insert([{ 
            customer_id: customerId, 
            merchant_id: user?.id, 
            stamps_count: 1,
            target_stamps: 6 
          }]);
      }
    }
    fetchBookings();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-black dark:text-white tracking-tight mb-2">Appointments</h2>
          <p className="text-gray-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            You have {bookings.length} total bookings in this category
          </p>
        </div>

        {/* Modern Filter Tabs */}
        <div className="flex bg-gray-100/50 dark:bg-gray-900/50 p-2 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm overflow-x-auto max-w-full">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-[1.5rem] text-xs font-black transition-all uppercase tracking-[0.15em] whitespace-nowrap ${
                filter === f 
                ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-xl shadow-purple-500/10 scale-105' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Syncing your schedule...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-24 rounded-[4rem] text-center border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-sm">
               <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon size={40} className="text-gray-200" />
               </div>
               <h3 className="text-2xl font-black dark:text-white mb-2 uppercase italic">All Clear!</h3>
               <p className="text-gray-400 font-bold">No appointments match your current filter.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-50 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-center gap-8 group hover:shadow-[0_30px_60px_-15px_rgba(124,58,237,0.1)] transition-all duration-500 hover:-translate-y-1"
              >
                
                {/* Left: Date & Main Info */}
                <div className="flex items-center gap-8 w-full xl:w-auto">
                  <div className="relative group">
                    <div className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 p-6 rounded-[2.5rem] text-center min-w-[100px] border border-purple-100 dark:border-purple-900/30 transition-transform group-hover:scale-105">
                      <span className="block text-xs font-black text-purple-400 uppercase mb-1">{format(new Date(booking.start_time), 'MMM')}</span>
                      <span className="block text-3xl font-black text-purple-600">{format(new Date(booking.start_time), 'dd')}</span>
                    </div>
                    {booking.status === 'completed' && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                        <Award size={14} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <h4 className="font-black text-2xl dark:text-white uppercase tracking-tighter">{booking.services?.name}</h4>
                       <span className="text-purple-600 font-black text-sm bg-purple-50 px-3 py-1 rounded-lg">${booking.services?.price}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <span className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
                        <Clock size={16} className="text-purple-400"/> {format(new Date(booking.start_time), 'hh:mm a')}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
                        <User size={16} className="text-purple-400"/> {booking.customer_name || 'Guest Customer'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto border-t xl:border-none pt-8 xl:pt-0">
                  
                  <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                    booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                    booking.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                    booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {booking.status}
                  </div>

                  <div className="flex gap-3">
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'completed', booking.customer_id)}
                        className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95"
                      >
                        <CheckCircle size={18} /> Complete
                      </button>
                    )}
                    
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'cancelled', booking.customer_id)}
                        className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[1.5rem] transition-all"
                      >
                        <XCircle size={22} />
                      </button>
                    )}
                    
                    <button className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-purple-50 hover:text-purple-600 rounded-[1.5rem] transition-all">
                      <ChevronRight size={22} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsManager;