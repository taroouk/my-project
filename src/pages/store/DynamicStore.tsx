import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import BookingCalendar from '../../components/BookingCalendar';
import { Clock, ShieldCheck, Star, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const DynamicStore = () => {
  const { slug } = useParams();
  const { user: authUser } = useAuth();
  const [merchant, setMerchant] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);

        // 1. جلب بيانات التاجر
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('store_slug', slug)
          .maybeSingle(); // استخدام maybeSingle لمنع توقف الكود عند عدم وجود نتائج

        if (profileError) throw profileError;

        if (profile) {
          setMerchant(profile);
          
          // 2. جلب الخدمات
          const { data: srvs, error: srvsError } = await supabase
            .from('services')
            .select('*')
            .eq('merchant_id', profile.id);
          
          if (srvsError) throw srvsError;
          setServices(srvs || []);
        } else {
          setError("Store not found");
        }
      } catch (err: any) {
        console.error("❌ Error fetching store:", err.message);
        setError(err.message);
      } finally {
        // التأكد أن التحميل سيتوقف مهما حدث
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [slug]);

  const handleBookingComplete = async (bookingDetails: any) => {
    setBookingStatus('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // شاشة التحميل المحسنة
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 font-black text-gray-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">
        Synchronizing Storefront...
      </p>
    </div>
  );

  // شاشة الخطأ أو عدم وجود متجر
  if (error || !merchant) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Store Not Found</h2>
      <p className="text-gray-400 font-bold mb-8 italic">The link you followed may be broken or the store has moved.</p>
      <Link to="/" className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all">
        Go Back Home
      </Link>
    </div>
  );

  const brandColor = merchant.brand_color || '#7c3aed';

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-50">
          <ShieldCheck size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">Confirmed!</h2>
        <p className="text-gray-400 font-bold max-w-md mx-auto mb-10 text-lg italic">
          Everything is set with {merchant.company_name}. See you soon!
        </p>
        <button 
          onClick={() => {setBookingStatus('idle'); setSelectedService(null);}}
          className="bg-black text-white px-10 py-5 rounded-3xl font-black hover:scale-105 transition-all shadow-2xl"
        >
          Book Another Service
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 font-sans transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 z-[60] bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
            style={{ backgroundColor: brandColor }}
          >
            {merchant.company_name?.[0]}
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter uppercase dark:text-white block leading-none">
              {merchant.company_name}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {merchant.business_type || 'Professional Service'}
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest">
          <ShieldCheck size={14} strokeWidth={3} /> Verified
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-24 pb-16 px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          <Sparkles size={14} /> New Slots Available
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 dark:text-white tracking-tighter leading-[0.9]">
          {merchant.brand_tagline || 'Experience Premium'}
        </h1>
        <div className="flex justify-center items-center gap-6 text-gray-400 font-black text-xs uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><Star size={18} className="text-yellow-400 fill-yellow-400"/> 4.9 (120+)</div>
          <span className="opacity-30">|</span>
          <div>OPEN UNTIL 9:00 PM</div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-8 pb-40 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black dark:text-white tracking-tighter uppercase italic">Select Service</h3>
            <div className="h-[2px] flex-1 mx-6 bg-gray-100 dark:bg-gray-800"></div>
          </div>

          <div className="space-y-4">
            {services.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`group p-10 rounded-[3.5rem] border-4 transition-all duration-500 cursor-pointer relative overflow-hidden ${
                  selectedService?.id === s.id 
                  ? 'border-transparent bg-white dark:bg-gray-900 shadow-2xl scale-[1.03]' 
                  : 'border-transparent bg-white/40 dark:bg-gray-900/40 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex-1">
                    <h4 className="font-black text-2xl mb-3 dark:text-white uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
                        <Clock size={16} className="text-purple-500" /> {s.duration_minutes} MIN
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black tracking-tighter dark:text-white" style={{ color: selectedService?.id === s.id ? brandColor : '' }}>
                      ${s.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Sidebar */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32">
            {selectedService ? (
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="bg-white dark:bg-gray-900 rounded-[4rem] p-4 shadow-3xl border border-gray-50 dark:border-gray-800 relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: brandColor }}></div>
                   <BookingCalendar 
                     serviceId={selectedService.id} 
                     merchantId={merchant.id} 
                     onBookingComplete={handleBookingComplete} 
                   />
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="mt-6 w-full flex items-center justify-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Services
                </button>
              </div>
            ) : (
              <div className="h-[500px] border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem] flex flex-col items-center justify-center text-center p-12 group transition-all">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 text-gray-200 group-hover:scale-110 group-hover:text-purple-200 transition-all duration-500">
                  <Clock size={48} strokeWidth={1} />
                </div>
                <h4 className="font-black text-gray-300 text-2xl uppercase tracking-tighter mb-4">Secure Your Spot</h4>
                <p className="text-gray-300 text-xs font-black uppercase tracking-[0.2em]">
                  Select a service to unlock slots
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DynamicStore;