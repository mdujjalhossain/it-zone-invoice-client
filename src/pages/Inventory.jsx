import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, Tag, DollarSign, Trash2, X, PlusCircle, MinusCircle } from 'lucide-react';
import useApi from '../Components/useApi';
import Swal from 'sweetalert2';

export default function Inventory() {
  useEffect(() => {
    document.title = "IT Zone-Inventory | Inventory";
  }, []);

  const { data: rawProducts, setData: setProducts, loading, error: apiError } = useApi('https://it-zone-invoice-server.vercel.app/products');
  
  const products = rawProducts || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Laptop',
    stock: '',
    buyPrice: '',
    sellPrice: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (showOnlyLowStock) {
      return matchesSearch && p.stock <= 3;
    }
    return matchesSearch;
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.stock === '' || newProduct.buyPrice === '' || newProduct.sellPrice === '') {
      setErrorMsg('Please fill out all required fields!');
      return;
    }

    const item = {
      name: newProduct.name,
      category: newProduct.category,
      stock: Number(newProduct.stock),
      buyPrice: Number(newProduct.buyPrice),
      sellPrice: Number(newProduct.sellPrice)
    };

    try {
      const res = await fetch('https://it-zone-invoice-server.vercel.app/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();

      if (data.success) {
        setProducts(prev => [data.data, ...(prev || [])]);
        setIsModalOpen(false);
        setNewProduct({ name: '', category: 'Laptop', stock: '', buyPrice: '', sellPrice: '' });
        setErrorMsg('');
      } else {
        setErrorMsg(data.error || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error posting product:', err);
      setErrorMsg('Network error occurred');
    }
  };

  const handleUpdateStock = async (item, changeAmount) => {
    const targetId = item._id || item.id;
    
    const actionType = changeAmount > 0 ? 'Stock Addition' : 'New Sale';
    const actionDesc = changeAmount > 0 
      ? `Would you like to add 1 unit to "${item.name}"?` 
      : `Did you sell 1 "${item.name}" today?`;

    const result = await Swal.fire({
      title: actionType,
      text: actionDesc,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: changeAmount > 0 ? '#10b981' : '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: changeAmount > 0 ? 'Yes, Add Stock!' : 'Yes, Sold! (-1)',
      cancelButtonText: 'Cancel',
      background: '#111827',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    const newQty = Number(item.stock) + changeAmount;
    
    if (newQty < 0) {
      Swal.fire({
        title: 'Invalid Operation',
        text: 'Stock cannot drop below zero!',
        icon: 'warning',
        background: '#111827',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    try {
      const res = await fetch(`https://it-zone-invoice-server.vercel.app/products/${targetId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: changeAmount })
      });
      const data = await res.json();

      if (data.success) {
        setProducts(prev => (prev || []).map(p => (p._id || p.id) === targetId ? { ...p, stock: newQty } : p));
        Swal.fire({
          title: 'Success!',
          text: changeAmount > 0 ? 'Stock successfully updated!' : 'Sale recorded successfully!',
          icon: 'success',
          background: '#111827',
          color: '#fff',
          timer: 1200,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Failed to update stock',
          icon: 'error',
          background: '#111827',
          color: '#fff'
        });
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, delete it!',
      background: '#111827',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    const targetId = id;
    try {
      const res = await fetch(`https://it-zone-invoice-server.vercel.app/products/${targetId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setProducts(prev => (prev || []).filter(p => (p._id || p.id) !== targetId));
        Swal.fire({
          title: 'Deleted!',
          text: 'Product has been deleted successfully.',
          icon: 'success',
          background: '#111827',
          color: '#fff',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Failed to delete',
          icon: 'error',
          background: '#111827',
          color: '#fff'
        });
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      Swal.fire({
        title: 'Network Error!',
        text: 'Could not connect to the server.',
        icon: 'error',
        background: '#111827',
        color: '#fff'
      });
    }
  };

  const totalStockValue = products.reduce((acc, item) => acc + (item.stock * item.sellPrice), 0);
  const lowStockCount = products.filter(p => p.stock <= 3).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
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

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {apiError}
        </div>
      )}

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

      <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Tag size={16} className="text-blue-400" /> Current Stock List
            </h3>
            <button
              onClick={() => setShowOnlyLowStock(prev => !prev)}
              className={`text-xs px-3 py-1 rounded-xl font-medium transition-all cursor-pointer border ${
                showOnlyLowStock 
                  ? 'bg-red-500/20 border-red-500 text-red-400' 
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {showOnlyLowStock ? 'Showing Low Stock Only (Reset)' : 'Filter Low Stock'}
            </button>
          </div>

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
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 text-sm">
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <tr 
                    key={item._id || item.id} 
                    className={`transition-all ${
                      item.stock <= 3 
                        ? 'bg-red-500/10 hover:bg-red-500/20 border-l-4 border-red-500' 
                        : 'hover:bg-gray-900/40'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="inline-flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-xl border border-gray-800">
                        <button 
                          onClick={() => handleUpdateStock(item, -1)}
                          className="text-red-400 hover:text-red-300 transition-all cursor-pointer"
                          title="Record Sale (-1 Stock)"
                        >
                          <MinusCircle size={16} />
                        </button>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          item.stock <= 3 
                            ? 'bg-red-500/20 text-red-400 animate-pulse' 
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {item.stock} Units {item.stock <= 3 && '(Low)'}
                        </span>
                        <button 
                          onClick={() => handleUpdateStock(item, 1)}
                          className="text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                          title="Add Stock (+1 Stock)"
                        >
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right text-gray-400">৳ {item.buyPrice}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-blue-400">৳ {item.sellPrice}</td>
                    <td className="py-3.5 px-5 text-center space-x-2">
                      <button 
                        onClick={() => handleDelete(item._id || item.id)}
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
                    No matching data found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

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