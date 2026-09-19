import { useState } from 'react';
import { Search, Plus, Package, AlertTriangle, Tag, DollarSign, Trash2, X } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([
    { id: 1, name: 'HP ProBook 440 G9 Laptop', category: 'Laptop', stock: 5, buyPrice: 58000, sellPrice: 65000 },
    { id: 2, name: 'Dahua 2MP Full HD CC Camera', category: 'Security', stock: 2, buyPrice: 1800, sellPrice: 2200 },
    { id: 3, name: '1TB Surveillance HDD', category: 'Accessories', stock: 12, buyPrice: 3800, sellPrice: 4500 },
    { id: 4, name: 'A4Tech Wireless Keyboard & Mouse', category: 'Accessories', stock: 1, buyPrice: 1200, sellPrice: 1600 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state for adding/editing product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Laptop',
    stock: '',
    buyPrice: '',
    sellPrice: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.stock === '' || newProduct.buyPrice === '' || newProduct.sellPrice === '') {
      setErrorMsg('Shobgulo field thikmoto fill up korun!');
      return;
    }

    const item = {
      id: Date.now(),
      name: newProduct.name,
      category: newProduct.category,
      stock: Number(newProduct.stock),
      buyPrice: Number(newProduct.buyPrice),
      sellPrice: Number(newProduct.sellPrice)
    };

    // Functional state update ensuring immutability
    setProducts(prev => [item, ...prev]);
    setIsModalOpen(false);
    setNewProduct({ name: '', category: 'Laptop', stock: '', buyPrice: '', sellPrice: '' });
    setErrorMsg('');
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const totalStockValue = products.reduce((acc, item) => acc + (item.stock * item.sellPrice), 0);
  const lowStockCount = products.filter(p => p.stock <= 3).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
            Stock & Warehousing
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Inventory Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Total Products</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{products.length} Items</h3>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Low Stock Alerts</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{lowStockCount} Products</h3>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Total Stock Value</p>
            <h3 className="text-xl font-bold text-green-400 mt-0.5">৳ {totalStockValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Tag size={16} className="text-blue-400" /> Current Stock List
          </h3>

          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase border-b border-gray-800">
                <th className="py-3 px-5">Product Name / Model</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5 text-center">Stock Qty</th>
                <th className="py-3 px-5 text-right">Buying Price</th>
                <th className="py-3 px-5 text-right">Selling Price</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/40 transition-all">
                    <td className="py-3.5 px-5 font-semibold text-white">{item.name}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.stock <= 3 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {item.stock} Units {item.stock <= 3 && '(Low)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-gray-400">৳ {item.buyPrice}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-blue-400">৳ {item.sellPrice}</td>
                    <td className="py-3.5 px-5 text-center space-x-2">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                    Kono matching product pawa jayni!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-blue-400" /> Add New Inventory Item
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Product Name / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Dell Inspiron 15"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Security">Security / CCTV</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Buying Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.buyPrice}
                    onChange={(e) => setNewProduct({...newProduct, buyPrice: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Selling Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.sellPrice}
                    onChange={(e) => setNewProduct({...newProduct, sellPrice: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}