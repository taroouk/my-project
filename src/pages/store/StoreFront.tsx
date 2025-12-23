import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Calendar, Clock, Phone, MapPin, 
  ChevronLeft, CheckCircle2, Star, Share2, Loader2 
} from 'lucide-react';

const StoreFront = () => {
  const { slug } = useParams(); 
  const [store, setStore] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: الخدمات, 2: البيانات, 4: نجاح

  const [bookingData, setBookingData] = useState({
    service_id: '',
    service_name: '',
    price: 0,
    date: '',
    time: '',
    customer_name: '',
    customer_phone: ''
  });

  useEffect(() => {
    fetchStoreData();
  }, [slug]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      // 1. جلب بيانات المتجر بناءً على الـ Slug
      const { data: storeData, error: storeError } = await supabase
        .from('users')
        .select('*')
        .eq('store_slug', slug)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // 2. جلب خدمات هذا التاجر
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('merchant_id', storeData.id)
        .eq('status', 'active');

      setServices(servicesData || []);
    } catch (err) {
      console.error("Store not found:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingData.date || !bookingData.time || !bookingData.customer_name || !bookingData.customer_phone) {
      alert("برجاء إكمال كافة البيانات");
      return;
    }

    try {
      setBookingLoading(true);
      
      // 1. تسجيل الحجز في جدول الحجوزات
      const { error: bookingError } = await supabase.from('bookings').insert([{
        merchant_id: store.id,
        service_id: bookingData.service_id,
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        total_price: bookingData.price,
        status: 'pending'
      }]);

      if (bookingError) throw bookingError;

      // 2. إرسال إشعار لحظي للتاجر (التعديل الجديد)
      await supabase.from('notifications').insert([{
        user_id: store.id,
        title: 'حجز جديد! 📅',
        message: `قام ${bookingData.customer_name} بحجز خدمة ${bookingData.service_name} بمبلغ ${bookingData.price} SAR`,
        type: 'booking'
      }]);

      setStep(4); // الانتقال لشاشة النجاح
    } catch (err: any) {
      alert("خطأ في الحجز: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-gray-900 tracking-widest uppercase text-xs">Servly Loading...</p>
    </div>
  );

  if (!store) return <div className="h-screen flex items-center justify-center font-black text-2xl text-red-500 italic underline">404 - المتجر غير موجود</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20" dir="rtl">
      
      {/* 1. Header & Brand */}
      <div className={`h-72 relative flex items-end p-8 transition-colors duration-700`} style={{ backgroundColor: store.brand_color || '#7C3AED' }}>
        <div className="absolute top-8 left-8 flex gap-2">
            <button className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all"><Share2 size={20}/></button>
        </div>
        
        <div className="flex items-center gap-6 translate-y-16 max-w-4xl mx-auto w-full">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border-[6px] border-white overflow-hidden text-4xl font-black text-purple-600 z-10">
            {store.logo_url ? <img src={store.logo_url} className="w-full h-full object-cover" alt="Logo" /> : store.store_name?.charAt(0)}
          </div>
          <div className="mb-6 z-10">
             <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-tighter">{store.store_name}</h1>
             <div className="flex items-center gap-3 mt-2">
                <p className="text-white/90 font-bold flex items-center gap-1 text-sm bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  <MapPin size={14}/> {store.address || 'العنوان غير محدد'}
                </p>
                <div className="flex items-center gap-1 text-yellow-400 font-black text-sm">
                  <Star size={14} fill="currentColor"/> 4.9
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Content */}
      <div className="max-w-4xl mx-auto mt-24 px-6">
        
        {/* Step 1: قائمة الخدمات */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">قائمة الخدمات</h2>
                <p className="text-gray-400 font-bold text-sm mt-1">اختر الخدمة التي ترغب بحجزها اليوم</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {services.length > 0 ? services.map(service => (
                <div 
                  key={service.id}
                  onClick={() => {
                    setBookingData({...bookingData, service_id: service.id, service_name: service.name, price: service.price});
                    setStep(2);
                  }}
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex justify-between items-center cursor-pointer hover:border-purple-600 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-400 font-bold text-xs flex items-center gap-1"><Clock size={12}/> {service.duration} دقيقة</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black text-purple-600 tracking-tighter">{service.price} <small className="text-xs">SAR</small></span>
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <ChevronLeft size={24}/>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-black italic">لا توجد خدمات متاحة حالياً</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: تفاصيل الحجز */}
        {step === 2 && (
          <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl shadow-purple-100/30 space-y-10 animate-in zoom-in-95 duration-500 border border-gray-50">
             <button onClick={() => setStep(1)} className="text-gray-400 font-black flex items-center gap-2 hover:text-purple-600 transition-colors uppercase text-xs tracking-widest">
                <ChevronLeft className="rotate-180" size={16}/> العودة للخدمات
             </button>
             
             <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">تأكيد الموعد</h2>
              <p className="text-purple-600 font-black mt-1">أنت الآن تحجز: {bookingData.service_name}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">التاريخ المفضل</label>
                  <input type="date" required className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all" onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">الوقت</label>
                  <input type="time" required className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all" onChange={(e) => setBookingData({...bookingData, time: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الثلاثي</label>
                  <input placeholder="ادخل اسمك هنا" required className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all" onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                  <input placeholder="05xxxxxxxx" required className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold border-2 border-transparent focus:border-purple-600 outline-none transition-all text-left" onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})} />
                </div>
             </div>

             <button 
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
             >
                {bookingLoading ? <Loader2 className="animate-spin" size={24}/> : "تأكيد الحجز الآن"}
             </button>
          </div>
        )}

        {/* Step 4: النجاح */}
        {step === 4 && (
          <div className="bg-white p-16 md:p-24 rounded-[5rem] text-center space-y-8 animate-in fade-in zoom-in duration-1000 border border-green-100 shadow-2xl shadow-green-100/50">
            <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
               <CheckCircle2 size={70} />
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter">رائع! تم حجزك</h2>
              <p className="text-gray-400 font-bold max-w-sm mx-auto">سيقوم فريق {store.store_name} بمراجعة حجزك وتأكيده عبر الهاتف قريباً.</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg hover:bg-black transition-all shadow-xl"
            >
              العودة للمتجر
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default StoreFront;