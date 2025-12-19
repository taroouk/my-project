import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingBag, Plus, Minus, CheckCircle2, 
  Loader2, X, Search, Star, ArrowRight 
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  merchant_id: string;
  image_url: string;
  category: string;
  description: string;
}

const StoreFront = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data || []);
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => p.id === id);
      return total + (product?.price || 0) * qty;
    }, 0);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    const firstProductId = Object.keys(cart)[0];
    const merchantId = products.find(p => p.id === firstProductId)?.merchant_id;

    const { error } = await supabase.from('orders').insert([{
      merchant_id: merchantId,
      customer_name: user?.user_metadata?.full_name || 'Guest Customer',
      total_price: calculateTotal(),
      status: 'pending'
    }]);

    if (!error) {
      setOrderSuccess(true);
      setCart({});
      setTimeout(() => { setOrderSuccess(false); setIsCheckoutModalOpen(false); }, 2500);
    }
    setIsProcessing(false);
  };

  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black italic">M</div>
          <span className="text-xl font-black tracking-tighter uppercase">Modern<span className="text-purple-600">Store</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          <a href="#" className="text-purple-600 underline underline-offset-8">Shop</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Categories</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Offers</a>
        </div>

        <button 
          onClick={() => setIsCheckoutModalOpen(true)}
          className="group relative bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-sm shadow-2xl hover:scale-105 transition-all"
        >
          <ShoppingBag size={18} />
          <span>Cart ({Object.values(cart).reduce((a, b) => a + b, 0)})</span>
        </button>
      </nav>

      {/* Hero Header */}
      <header className="px-8 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-6xl md:text-7xl font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Essentials for <span className="text-purple-600">Everyday</span>.
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
          Experience the future of shopping with our curated collection of premium goods, delivered straight to your door.
        </p>
        
        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all
                ${filter === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-white border border-gray-100 text-gray-400 hover:border-purple-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-8 pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredProducts.map(product => (
          <div key={product.id} className="group flex flex-col animate-in fade-in duration-1000">
            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-900 rounded-[2.5rem] mb-6 overflow-hidden shadow-sm transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
              {product.image_url ? (
                <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag size={64}/></div>
              )}
              <button 
                onClick={() => addToCart(product.id)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white"
              >
                <Plus />
              </button>
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1 block">{product.category}</span>
                <h3 className="font-bold text-xl">{product.name}</h3>
              </div>
              <p className="font-black text-xl">${product.price}</p>
            </div>
            <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
          </div>
        ))}
      </main>

      {/* Checkout Sidebar/Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckoutModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black">Your Cart</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><X/></button>
            </div>

            {orderSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <h4 className="text-2xl font-black mb-2">Payment Received!</h4>
                <p className="text-gray-400">Your order is being prepared by the merchant.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                  {Object.entries(cart).length === 0 ? (
                    <div className="text-center py-20 opacity-30 font-bold">Your cart is empty.</div>
                  ) : Object.entries(cart).map(([id, qty]) => {
                    const p = products.find(prod => prod.id === id);
                    return (
                      <div key={id} className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                          <img src={p?.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-sm">{p?.name}</h5>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => removeFromCart(id)} className="w-6 h-6 border rounded-md flex items-center justify-center text-gray-400"><Minus size={12}/></button>
                            <span className="text-xs font-black">{qty}</span>
                            <button onClick={() => addToCart(id)} className="w-6 h-6 border rounded-md flex items-center justify-center text-gray-400"><Plus size={12}/></button>
                          </div>
                        </div>
                        <p className="font-black text-sm">${(p?.price || 0) * qty}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 font-bold text-sm uppercase">Subtotal</span>
                    <span className="font-black">${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between mb-8">
                    <span className="text-gray-400 font-bold text-sm uppercase">Shipping</span>
                    <span className="font-black text-green-500 uppercase text-xs tracking-widest">Free</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing || Object.keys(cart).length === 0}
                    className="w-full bg-black dark:bg-purple-600 text-white py-6 rounded-3xl font-black text-lg shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Complete Checkout <ArrowRight size={20}/></>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreFront;