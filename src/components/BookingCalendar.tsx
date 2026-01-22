import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

interface BookingCalendarProps {
  serviceId: string;
  merchantId: string;
  onBookingComplete: (details: any) => void;
}

const BookingCalendar = ({ serviceId, merchantId, onBookingComplete }: BookingCalendarProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // توليد مواعيد افتراضية (مثال: من 9 صباحاً لـ 8 مساءً)
  const generateSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    setAvailableSlots(slots);
  };

  useEffect(() => {
    generateSlots();
    setSelectedSlot(null);
  }, [selectedDate]);

  const handleFinalBooking = async () => {
    if (!selectedSlot || isSubmitting) return;

    setIsSubmitting(true);
    
    // دمج التاريخ مع الوقت المختار
    const [hours, minutes] = selectedSlot.split(':');
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          merchant_id: merchantId,
          service_id: serviceId,
          customer_id: user?.id || null,
          customer_name: user?.user_metadata?.full_name || "Guest Client",
          start_time: bookingDateTime.toISOString(),
          status: 'pending'
        }
      ]);

    if (!error) {
      onBookingComplete(data);
    } else {
      alert("Error saving booking: " + error.message);
    }
    setIsSubmitting(false);
  };

  // توليد الأيام السبعة القادمة للاختيار
  const nextSevenDays = [...Array(7)].map((_, i) => addDays(new Date(), i));

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* 1. Date Picker (Horizontal) */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Select Date</label>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {nextSevenDays.map((date) => (
            <button
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-20 py-6 rounded-[2rem] flex flex-col items-center justify-center transition-all border-2 ${
                isSameDay(selectedDate, date)
                ? 'bg-black border-black text-white shadow-xl scale-105'
                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
              }`}
            >
              <span className="text-[10px] font-black uppercase mb-1">{format(date, 'EEE')}</span>
              <span className="text-xl font-black">{format(date, 'd')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Time Slots Grid */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Available Slots</label>
        <div className="grid grid-cols-3 gap-3">
          {availableSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                selectedSlot === slot
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                : 'bg-white border-gray-100 text-gray-900 hover:border-purple-200'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Confirmation Button */}
      <div className="pt-6">
        <button
          disabled={!selectedSlot || isSubmitting}
          onClick={handleFinalBooking}
          className="w-full bg-purple-600 disabled:bg-gray-100 disabled:text-gray-300 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-purple-200 flex items-center justify-center gap-3 transition-all active:scale-95 group"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Confirm Appointment <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>
        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
          <CheckCircle2 size={12} className="text-emerald-500" /> Instant Confirmation
        </p>
      </div>
    </div>
  );
};

export default BookingCalendar;