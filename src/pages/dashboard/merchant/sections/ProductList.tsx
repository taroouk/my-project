import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  Package, Plus, Search, Trash2, Edit3, 
  Tag, BarChart3, Loader2, ShoppingCart, 
  AlertTriangle, ArrowUpRight 
} from 'lucide-react';

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate quick stats
  const lowStockItems = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="ltr">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Physical Products</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Manage your inventory and direct sales</p>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-100 active:scale-95">
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Inventory Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Package size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Total SKUs</p>
                <p className="text-xl font-black text-gray-900">{products.length}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Low Stock</p>
                <p className="text-xl font-black text-amber-600">{lowStockItems} Items</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Out of Stock</p>
                <p className="text-xl font-black text-red-600">{outOfStockItems} Items</p>
            </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-indigo-600" size={32} />
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Scanning Warehouse...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full bg-gray-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm mb-6">
                <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No products in stock</h3>
            <p className="text-gray-400 font-bold mb-8 text-sm max-w-xs">You haven't added any physical items to your inventory yet.</p>
            <button className="text-indigo-600 font-black underline underline-offset-8 decoration-2 hover:text-indigo-800 transition-colors">Import Catalog</button>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative">
              <div className="absolute top-8 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="bg-white/90 backdrop-blur-md p-2 rounded-xl text-gray-400 hover:text-red-500 shadow-sm transition-colors">
                    <Trash2 size={16} />
                 </button>
              </div>

              <div className="w-full h-48 bg-gray-50 rounded-[2rem] mb-6 flex items-center justify-center text-gray-200 overflow-hidden relative border border-gray-50">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <Package size={48} />
                )}
                <div className="absolute bottom-4 left-4">
                   <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-gray-900 uppercase shadow-sm">
                      {product.category || 'Standard'}
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-black text-gray-900 text-lg tracking-tight truncate flex-1">{product.name}</h3>
                    <button className="text-gray-300 hover:text-indigo-600 transition-colors ml-2">
                        <Edit3 size={18} />
                    </button>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Retail Price</span>
                    <span className="text-2xl font-black text-indigo-600 tracking-tighter">
                        <small className="text-[10px] mr-1">SAR</small>{product.price}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border ${
                        product.stock > 10 ? 'bg-green-50 text-green-600 border-green-100' : 
                        product.stock > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                    }`}>
                        {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Quick Edit <ArrowUpRight size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;