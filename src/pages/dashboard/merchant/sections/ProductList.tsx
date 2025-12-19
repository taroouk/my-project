import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { Plus, Package, Trash2, Edit3, Search, Loader2, X, Upload, ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image_url: string;
}

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', price: '', stock: '', category: '', description: '', image_url: '' 
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('merchant_id', user?.id).order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchProducts(); }, [user]);

  // دالة رفع الصور لـ Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      alert('Error uploading image!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      merchant_id: user?.id
    };

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert([payload]);
    }

    setIsModalOpen(false);
    setFormData({ name: '', price: '', stock: '', category: '', description: '', image_url: '' });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black">Inventory</h2>
          <p className="text-gray-500">Manage products and stock levels.</p>
        </div>
        <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-gray-800 p-5 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 group relative">
            <div className="w-full h-48 bg-gray-50 dark:bg-gray-900 rounded-[2rem] mb-4 overflow-hidden shadow-inner">
              {p.image_url ? (
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={40}/></div>
              )}
            </div>
            <h4 className="font-bold text-lg mb-1">{p.name}</h4>
            <p className="text-purple-600 font-black text-xl mb-4">${p.price}</p>
            <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-700 pt-4">
              <span className="text-xs font-bold text-gray-400">Stock: {p.stock}</span>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="w-full h-64 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] relative flex items-center justify-center overflow-hidden">
                  {formData.image_url ? (
                    <img src={formData.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      {isUploading ? <Loader2 className="animate-spin text-purple-600 mx-auto" /> : <Upload className="text-gray-300 mx-auto mb-2" />}
                      <p className="text-xs text-gray-400 font-bold">Upload Product Image</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-4">
                <input required placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-purple-500" />
                <div className="flex gap-4">
                  <input required type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-1/2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none" />
                  <input required type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-1/2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none" />
                </div>
                <input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none outline-none" />
                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-24 outline-none" />
                <button type="submit" disabled={isUploading} className="w-full bg-purple-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">
                  {isUploading ? 'Uploading...' : (editingId ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;