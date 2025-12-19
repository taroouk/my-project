import { Star } from 'lucide-react';

interface LoyaltyCardProps {
  stamps: number;
  target: number;
  brandColor: string;
  companyName: string;
}

const LoyaltyCard = ({ stamps, target, brandColor, companyName }: LoyaltyCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
      {/* تأثير خلفية جمالي */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:scale-150 transition-transform duration-700" style={{ color: brandColor }}>
        <Star size={120} fill="currentColor" />
      </div>

      <div className="relative z-10">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{companyName} Rewards</h4>
        <h3 className="text-2xl font-black mb-6 dark:text-white">Loyalty Stamp Card</h3>
        
        {/* شبكة الأختام */}
        <div className="flex flex-wrap gap-4 mb-8">
          {Array.from({ length: target }).map((_, i) => (
            <div 
              key={i}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                i < stamps 
                ? 'scale-110 shadow-lg shadow-purple-100' 
                : 'border-dashed border-gray-200 opacity-30'
              }`}
              style={{ 
                backgroundColor: i < stamps ? brandColor : 'transparent',
                borderColor: i < stamps ? brandColor : '#e5e7eb',
                color: i < stamps ? 'white' : '#9ca3af'
              }}
            >
              <Star size={20} fill={i < stamps ? "white" : "none"} />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-black dark:text-white">{stamps} / {target}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Stamps Collected</p>
          </div>
          {stamps >= target ? (
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-sm animate-bounce">
              REDEEM GIFT! 🎁
            </div>
          ) : (
            <p className="text-[10px] font-black text-gray-300 uppercase italic">
              {target - stamps} more to go!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;