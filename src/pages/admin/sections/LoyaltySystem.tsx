import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Gift, Star, Save, PlusCircle, Loader2 } from 'lucide-react';

const LoyaltySystem = () => {
  const [pointsPerDollar, setPointsPerDollar] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('loyalty_settings')
          .select('points_per_dollar')
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
        if (data) setPointsPerDollar(data.points_per_dollar);
      } catch (error) {
        console.error('Error loading loyalty settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateRules = async () => {
    try {
      setIsSaving(true);
      // We use upsert to update the record with id: 1 (our global settings)
      const { error } = await supabase
        .from('loyalty_settings')
        .upsert({ id: 1, points_per_dollar: pointsPerDollar, updated_at: new Date() });

      if (error) throw error;
      alert('Loyalty rules updated successfully!');
    } catch (error) {
      console.error('Error updating rules:', error);
      alert('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Loyalty & Rewards</h2>
        <p className="text-gray-500 mt-1">Configure points, discounts, and gifts for loyal customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Points Configuration */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <Star size={28} />
          </div>
          <h3 className="text-xl font-bold mb-4">Point Rules</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">Points earned per $1 spent</label>
              {isLoading ? (
                <div className="h-14 w-full bg-gray-50 animate-pulse rounded-xl" />
              ) : (
                <input 
                  type="number" 
                  value={pointsPerDollar}
                  onChange={(e) => setPointsPerDollar(Number(e.target.value))}
                  className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-lg" 
                />
              )}
            </div>
            
            <button 
              onClick={handleUpdateRules}
              disabled={isSaving || isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-purple-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Saving Changes...' : 'Update Rules'}
            </button>
          </div>
        </div>

        {/* Active Rewards Section (Static UI for now, logic can be added later) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
              <Gift size={28} />
            </div>
            <button className="text-purple-600 hover:bg-purple-50 p-2 rounded-xl transition-colors">
              <PlusCircle size={24} />
            </button>
          </div>
          <h3 className="text-xl font-bold mb-4">Redemption Rewards</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div>
                <span className="text-md font-bold block text-gray-800 dark:text-gray-200">20% Discount Code</span>
                <span className="text-xs text-gray-400 font-medium">Cost: 1000 Points</span>
              </div>
              <span className="text-[10px] font-black bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase">Active</span>
            </div>

            <div className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 opacity-60">
              <div>
                <span className="text-md font-bold block text-gray-800 dark:text-gray-200">Free Product</span>
                <span className="text-xs text-gray-400 font-medium">Cost: 5000 Points</span>
              </div>
              <span className="text-[10px] font-black bg-gray-200 text-gray-500 px-3 py-1 rounded-full uppercase">Paused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySystem;