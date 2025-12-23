import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import BookingCalendar from '../../components/BookingCalendar';
import { Clock, ShieldCheck, Star, ArrowLeft, Sparkles, AlertCircle, Store, MapPin } from 'lucide-react';

const DynamicStore = () => {
  const { slug } = useParams();
  const [store, setStore] = useState<any>(null);
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

        // 1. جلب بيانات المتجر من جدول stores (وليس users)
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (storeError) throw storeError;

        if (storeData) {
          setStore(storeData);
          
          // 2. جلب الخدمات المرتبطة بالتاجر صاحب هذا المتجر
          const { data: srvs, error: srvsError } = await supabase
            .from('services')
            .select('*')
            .eq('merchant_id', storeData.merchant_id);
          
          if (srvsError) throw srvsError;
          setServices(srvs || []);
        } else {
          setError("Store not found");
        }
      } catch (err: any) {
        console.error("❌ Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [slug]);

  const handleBookingComplete = () => {
    setBookingStatus('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin" />
      <p className="mt-4 font-black text-gray-400 text-[10px] tracking-widest uppercase">Building Experience...</p>
    </div>
  );

  if (error || !store) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-50">
      <AlertCircle size={60} className="text-red-500 mb-6" />
      <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Store Not Found</h2>
      <Link to="/" className="text-purple-600 font-bold underline">Return to Servly</Link>
    </div>
  );

  const brandColor = store.theme_color || '#7c3aed';
  const layout = store.layout_type || 'classic';

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase">Booking Confirmed!</h2>
        <p className="text-gray-500 font-bold mb-8">We've sent the details to {store.name}.</p>
        <button onClick={() => {setBookingStatus('idle'); setSelectedService(null);}} className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest">Book Another</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FDFDFF] text-gray-900 ${store.theme_style === 'elegant' ? 'font-serif' : 'font-sans'}`}>
      
      {/* Dynamic Navbar */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg" style={{ backgroundColor: brandColor }}>
            {store.name?.[0]}
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">{store.name}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
           <ShieldCheck size={14} /> Trusted Partner
        </div>
      </nav>

      {/* Hero Section based on Layout */}
      {layout === 'modern' ? (
        <header className="relative h-[40vh] bg-gray-900 flex items-end p-12 overflow-hidden" style={{ backgroundColor: brandColor }}>
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070')] bg-cover bg-center" />
          <div className="relative z-10 text-white max-w-5xl mx-auto w-full">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 uppercase">{store.name}</h1>
            <p className="text-xl opacity-90 font-bold italic">{store.description}</p>
          </div>
        </header>
      ) : (
        <header className="pt-20 pb-12 px-6 text-center max-w-4xl mx-auto animate-in slide-in-from-top-4">
          <div className="w-24 h-24 mx-auto mb-8 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-transform hover:rotate-12" style={{ backgroundColor: brandColor }}>
            <Store size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 leading-none">{store.name}</h1>
          <p className="text-gray-400 text-lg font-bold tracking-tight max-w-xl mx-auto">{store.description}</p>
          <div className="flex justify-center gap-6 mt-8">
             <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest"><Star size={14} className="text-yellow-400 fill-yellow-400" /> 5.0</div>
             <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest"><MapPin size={14} /> Instant Booking</div>
          </div>
        </header>
      )}

      {/* Main Grid */}
      <main className={`max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 ${layout === 'modern' ? '-mt-10' : ''}`}>
        
        {/* Services Side */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Available Services</h2>
            <div className="h-[2px] flex-1 bg-gray-100" />
          </div>

          <div className={`grid gap-4 ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {services.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`group p-8 rounded-[2.5rem] border-4 transition-all duration-300 cursor-pointer relative ${
                  selectedService?.id === s.id 
                  ? 'bg-white border-transparent shadow-2xl scale-[1.02]' 
                  : 'bg-white/50 border-transparent hover:bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black uppercase mb-2 group-hover:text-purple-600 transition-colors">{s.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Clock size={12} /> {s.duration_minutes} MIN</span>
                       {selectedService?.id === s.id && <span className="text-emerald-500 flex items-center gap-1"><Sparkles size={12} /> Selected</span>}
                    </div>
                  </div>
                  <div className="text-2xl font-black tracking-tighter" style={{ color: selectedService?.id === s.id ? brandColor : '' }}>
                    ${s.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-5 relative">
           <div className="sticky top-28">
              {selectedService ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <div className="bg-white rounded-[3rem] p-4 shadow-3xl border border-gray-50 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: brandColor }} />
                    <div className="p-4 border-b border-gray-50 mb-4 flex justify-between items-center">
                       <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">Checkout</span>
                       <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-gray-50 rounded-full"><ArrowLeft size={16}/></button>
                    </div>
                    <BookingCalendar 
                      serviceId={selectedService.id} 
                      merchantId={store.merchant_id} 
                      onBookingComplete={handleBookingComplete} 
                    />
                  </div>
                </div>
              ) : (
                <div className="h-[400px] border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-10">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                      <Clock size={32} />
                   </div>
                   <h4 className="font-black text-gray-300 uppercase tracking-tighter text-xl">Select a service</h4>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-2">to view available time slots</p>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-gray-50">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Powered by Servly</p>
      </footer>
    </div>
  );
};

export default DynamicStore;