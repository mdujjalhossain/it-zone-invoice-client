import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, ShoppingCart, User, MapPin, Phone, Calendar, Hash, Loader2, Wrench, Briefcase } from 'lucide-react';
import Swal from 'sweetalert2';

export default function POSScreen() {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Added sales type state to switch between Product Sale and Service Sale
  const [salesType, setSalesType] = useState('product'); // 'product' | 'service'

  // Manual state for products so we can refetch/update easily after invoice submission
  const [productList, setProductList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setInventoryLoading(true);
      const res = await fetch('https://it-zone-invoice-server.vercel.app/products');
      const rawInventory = await res.json();
      const list = Array.isArray(rawInventory) 
        ? rawInventory 
        : (rawInventory?.data && Array.isArray(rawInventory.data) ? rawInventory.data : []);
      setProductList(list);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    document.title = "IT Zone-Inventory | POS";
    fetchProducts();
  }, []);

  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const [items, setItems] = useState([
    { id: 1, productId: '', productName: '', quantity: 1, price: 0, stock: 0 }
  ]);

  const [discount, setDiscount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const randomId = (salesType === 'service' ? 'ITZ-SRV-' : 'ITZ-') + Math.floor(100000 + Math.random() * 900000);
    setInvoiceNo(randomId);

    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, [salesType]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), productId: '', productName: '', quantity: 1, price: 0, stock: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleProductSelect = (id, selectedProductId) => {
    const selectedProd = productList.find(p => (p._id === selectedProductId || p.id === selectedProductId));
    
    const updatedItems = items.map(item => {
      if (item.id === id) {
        if (!selectedProd) {
          return { id, productId: '', productName: '', quantity: 1, price: 0, stock: 0 };
        }
        return {
          ...item,
          productId: selectedProd._id || selectedProd.id,
          productName: selectedProd.productName || selectedProd.name || '',
          price: Number(selectedProd.sellingPrice || selectedProd.price || 0),
          stock: Number(selectedProd.quantity || selectedProd.stock || 0),
          quantity: 1 
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleItemFieldChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        let val = value;
        if (field === 'quantity' || field === 'price') {
          val = value === '' ? '' : Math.max(0, Number(value));
          if (salesType === 'product' && field === 'quantity' && val > item.stock && item.stock > 0) {
            Swal.fire({
              title: 'Stock Warning',
              text: `Requested quantity (${val}) exceeds available stock (${item.stock})!`,
              icon: 'warning',
              background: '#111827',
              color: '#f3f4f6',
              confirmButtonColor: '#3b82f6'
            });
          }
        }
        return { ...item, [field]: val };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (/^[0-9+-\s]*$/.test(val)) {
      setCustomer({ ...customer, phone: val });
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
  const discountVal = discount === '' ? 0 : Number(discount);
  const totalPayable = Math.max(0, subtotal - discountVal);

  const handlePrint = async () => {
    if (!customer.name || !customer.phone || customer.phone.length < 10) {
      setErrorMsg("Please enter valid customer name and phone number for invoice print!");
      return;
    }

    if (salesType === 'product' && items.some(item => !item.productName || item.price <= 0 || !item.quantity)) {
      setErrorMsg("Please ensure all items have a selected product, valid quantity, and price!");
      return;
    }

    if (salesType === 'service' && items.some(item => !item.productName || item.price <= 0)) {
      setErrorMsg("Please ensure all service items have a description and valid price!");
      return;
    }

    if (salesType === 'product') {
      for (const item of items) {
        if (item.stock > 0 && item.quantity > item.stock) {
          setErrorMsg(`Item "${item.productName}" exceeds current stock limit (${item.stock} available).`);
          return;
        }
      }
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const invoicePayload = {
      invoiceNo,
      currentDate,
      customer,
      salesType, // sent to differentiate product vs service billing
      items: items.map(i => ({
        productId: i.productId || null,
        productName: i.productName,
        quantity: Number(i.quantity),
        price: Number(i.price)
      })),
      subtotal,
      discountVal,
      totalPayable
    };

    try {
      // Endpoint routing based on sales type
      const endpoint = salesType === 'service' 
        ? 'https://it-zone-invoice-server.vercel.app/services-invoice' 
        : 'https://it-zone-invoice-server.vercel.app/invoices-with-stock';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process invoice and update records');
      }
      
      if (salesType === 'product') {
        await fetchProducts();
      }

      setIsSubmitting(false);
      window.print();
    } catch (err) {
      console.error('Network or database error:', err);
      setErrorMsg('Failed to sync invoice with database or update records. Print aborted.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ----- PRINT ONLY INVOICE TEMPLATE ----- */}
      <div className="hidden print:flex flex-col justify-between bg-white text-black p-14 w-[210mm] h-[270mm] mx-auto font-sans box-border relative overflow-hidden">
        <div>
          <div className="flex justify-between items-start border-b-2 border-gray-800 pt-10 pb-3 mb-3">
            <div>
              <h1 className="text-2xl font-black tracking-wider text-blue-600">IT ZONE</h1>
              <p className="text-[14px] text-gray-600 font-semibold mt-0.5">Shop No. E-174, Sena Complex, Nabinagar, Savar, Dhaka</p>
              <p className="text-[14px] text-gray-600">Phone: +880 1624-687651</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">
                {salesType === 'service' ? 'SERVICE INVOICE' : 'INVOICE'}
              </h2>
              <p className="text-[14px] text-gray-600 mt-0.5"><span className="font-semibold">Invoice No:</span> {invoiceNo}</p>
              <p className="text-[14px] text-gray-600"><span className="font-semibold">Date:</span> {currentDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3 bg-gray-50 p-2.5 rounded border border-gray-200">
            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Seller</h3>
              <p className="font-bold text-gray-900">IT ZONE</p>
              <p className="text-[14px] text-gray-600">Savar Sena Complex</p>
              <p className="text-[14px] text-gray-600">Phone: +8801624687651</p>
            </div>
            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Bill To</h3>
              <p className="font-bold text-gray-900">{customer.name || '[Customer Name]'}</p>
              <p className="text-[14px] text-gray-600">Address: {customer.address || '[Customer Address]'}</p>
              <p className="text-[14px] text-gray-600">Phone: +88{customer.phone || '[Contact No]'}</p>
            </div>
          </div>

          <table className="w-full mb-3 border-collapse">
            <thead>
              <tr className="bg-black text-white text-[10px] uppercase">
                <th className="py-1.5 px-2 text-left">{salesType === 'service' ? 'Service Description' : 'Description / Product'}</th>
                <th className="py-1.5 px-2 text-center w-16">Qty</th>
                <th className="py-1.5 px-2 text-right w-24">Unit Price</th>
                <th className="py-1.5 px-2 text-right w-24">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1.5 px-2 text-gray-800 font-medium">{item.productName || 'Item'}</td>
                  <td className="py-1.5 px-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-right text-gray-600">৳ {item.price}</td>
                  <td className="py-1.5 px-2 text-right font-semibold text-gray-900">৳ {Number(item.quantity || 0) * Number(item.price || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-4">
            <div className="w-56 space-y-1 text-xs border-t border-gray-300 pt-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">৳ {subtotal}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span className="font-semibold text-red-600">-৳ {discountVal}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-800 pt-1 text-black">
                <span>Total Payable:</span>
                <span>৳ {totalPayable}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded p-2.5 bg-gray-50/50 text-[12px] space-y-1 text-gray-700 mb-4 mt-10">
            <p className="font-bold text-black uppercase tracking-wide border-b border-gray-200 pb-1 mb-1">Warranty & Replacement Terms:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><span className="font-semibold">14 Days Replacement Guarantee</span> for manufacturing defects.</li>
              <li><span className="font-semibold">3 Years Service Warranty</span> available (Parts excluded).</li>
              <li><span className="font-semibold text-red-600">No Warranty & Guarantee</span> applicable for Display or Screen.</li>
            </ul>
          </div>
        </div>

        <div className="text-center border-t border-gray-300 pt-2 mt-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest bg-black text-white py-1">Thank you for your business with IT ZONE!</p>
        </div>
      </div>
      
      {/* ----- NORMAL WEB UI SCREEN ----- */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
              Automated POS & Inventory Sync
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Create New Invoice</h1>
          </div>
          <button
            onClick={handlePrint}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />} 
            Complete & Print Invoice
          </button>
        </div>

        {/* Sales Type Selection Bar */}
        <div className="bg-[#111827] border border-gray-800 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <ShoppingCart size={16} className="text-blue-400" /> Select Sales Type:
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSalesType('product');
                setItems([{ id: 1, productId: '', productName: '', quantity: 1, price: 0, stock: 0 }]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                salesType === 'product'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              <ShoppingCart size={14} /> Product Sale
            </button>
            <button
              type="button"
              onClick={() => {
                setSalesType('service');
                setItems([{ id: 1, productId: '', productName: '', quantity: 1, price: 0, stock: 0 }]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                salesType === 'service'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              <Wrench size={14} /> Service Sale
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-xs font-bold uppercase cursor-pointer hover:underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Details Card */}
            <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 border-b border-gray-800 pb-2 flex items-center gap-2">
                <User size={16} className="text-blue-400" /> Customer & Invoice Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Invoice ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Hash size={16} /></span>
                    <input
                      type="text"
                      value={invoiceNo}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-300 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Calendar size={16} /></span>
                    <input
                      type="date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><User size={16} /></span>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Contact Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Phone size={16} /></span>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={customer.phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><MapPin size={16} /></span>
                    <input
                      type="text"
                      placeholder="House, Road, Area, City"
                      value={customer.address}
                      onChange={(e) => setCustomer({...customer, address: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products or Services Selection Card */}
            <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  {salesType === 'service' ? (
                    <><Wrench size={16} className="text-amber-400" /> Service Repair Billing <span className="text-red-400">*</span></>
                  ) : (
                    <><ShoppingCart size={16} className="text-blue-400" /> Inventory Products Selection <span className="text-red-400">*</span></>
                  )}
                </h3>
                <button
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="flex flex-col md:flex-row items-center gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                    <span className="text-xs text-gray-500 font-bold w-6">#{index + 1}</span>
                    
                    <div className="flex-1 w-full">
                      {salesType === 'product' ? (
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductSelect(item.id, e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Select Product from Inventory --</option>
                          {inventoryLoading ? (
                            <option disabled>Loading inventory...</option>
                          ) : (
                            productList.map(prod => {
                              const cleanName = prod.productName || prod.name;
                              return (
                                <option key={prod._id || prod.id} value={prod._id || prod.id}>
                                  {cleanName} (Stock: {prod.quantity ?? prod.stock ?? 0})
                                </option>
                              );
                            })
                          )}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Enter service/repair details (e.g. Display Issue)"
                          value={item.productName}
                          onChange={(e) => handleItemFieldChange(item.id, 'productName', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
                        />
                      )}
                    </div>

                    <div className="w-full md:w-24">
                      <input
                        type="number"
                        min="1"
                        max={salesType === 'product' ? (item.stock || 9999) : 9999}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                      {salesType === 'product' && <span className="text-[10px] text-gray-400 block mt-0.5">Available: {item.stock}</span>}
                    </div>

                    <div className="w-full md:w-32">
                      <input
                        type="number"
                        min="0"
                        placeholder="Price (৳)"
                        value={item.price === 0 ? '' : item.price}
                        onChange={(e) => handleItemFieldChange(item.id, 'price', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-28 text-right font-bold text-sm text-blue-400">
                      ৳ {Number(item.quantity || 0) * Number(item.price || 0)}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className={`p-2 rounded-lg transition-all ${items.length === 1 ? 'text-gray-700 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/10 cursor-pointer'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Payment Summary */}
          <div className="space-y-6">
            <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-6 sticky top-20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 border-b border-gray-800 pb-2">
                Payment Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-200">৳ {subtotal}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Discount Amount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount === 0 ? '' : discount}
                    onChange={(e) => setDiscount(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Total Payable</span>
                  <span className="text-xl font-extrabold text-blue-400">৳ {totalPayable}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handlePrint}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />} 
                  Complete & Print Invoice
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}