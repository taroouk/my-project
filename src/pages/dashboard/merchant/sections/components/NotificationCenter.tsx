import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useAuth } from '../../../../../contexts/AuthContext';
import { 
  Bell, BellRing, Check, Calendar, 
  Package, Info, X, Circle, 
  Sparkles, CheckCheck 
} from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(8);
    setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" dir="ltr">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative p-3 rounded-2xl transition-all active:scale-90 ${
          isOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
        }`}
      >
        {unreadCount > 0 ? (
          <BellRing size={22} className={isOpen ? 'animate-none' : 'animate-bounce text-indigo-500'} />
        ) : (
          <Bell size={22} />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-4 w-[340px] bg-white shadow-2xl rounded-[2.5rem] border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            
            {/* Header */}
            <div className="p-6 bg-gray-50/50 flex justify-between items-center border-b border-gray-100">
              <div>
                <h4 className="font-black text-gray-900 text-sm tracking-tight">Activity Feed</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Latest Updates</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200">
                    <Sparkles size={24} />
                  </div>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">No new notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-5 border-b border-gray-50 flex gap-4 transition-colors group relative ${
                      !n.is_read ? 'bg-indigo-50/30' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {/* Status Indicator Dot */}
                    {!n.is_read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Circle size={6} className="fill-indigo-500 text-indigo-500" />
                      </div>
                    )}

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'booking' ? 'bg-purple-100 text-purple-600' : 
                      n.type === 'stock' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {n.type === 'booking' ? <Calendar size={18} /> : 
                       n.type === 'stock' ? <Package size={18} /> : 
                       <Info size={18} />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-black text-gray-900 leading-tight">{n.title}</p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-gray-300 font-bold uppercase mt-2 tracking-tighter">Just now</p>
                    </div>

                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-emerald-500 hover:bg-emerald-50"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <button className="w-full p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors border-t border-gray-100">
              View All Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;