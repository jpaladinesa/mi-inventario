import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  LogIn, Package, LayoutDashboard, ClipboardList, Users, Search, Plus, 
  AlertTriangle, Percent, Edit, Trash2, Menu as MenuIcon, DollarSign, 
  UserCheck, Tag, Info, Scale, Barcode, ShoppingCart, Boxes, ArrowUpRight, 
  History, X, ChevronDown, Mail, Phone, PhoneCall, UserPlus, Fingerprint, 
  Clock, User, CheckCircle2, Truck, FileText, ChevronRight, UserCircle, 
  Receipt, Calculator, Eye, Download, Printer, XCircle, Activity, Calendar, 
  ShieldCheck, MapPin, MessageCircle, Smartphone, UploadCloud, FileSpreadsheet
} from 'lucide-react';
import { InventoryContext } from './InventoryContext';
import { Footer, RealTimeClock, Login } from './components/CommonComponents';

// --- MOTOR DE CÁLCULO DE STOCK DINÁMICO ---
const calculateAvailableStock = (productId, inventory, orders) => {
  const totalIn = inventory.filter(i => i.productId === productId).reduce((sum, item) => sum + item.quantity, 0);
  const totalOut = orders
    .filter(o => o.status !== 'CANCELADA')
    .reduce((acc, order) => {
      const itemsOut = order.items.filter(i => i.productId === productId).reduce((sum, i) => sum + i.quantity, 0);
      return acc + itemsOut;
    }, 0);
  return totalIn - totalOut;
};

const formatWaPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('57') ? cleaned : `57${cleaned}`;
};

const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);


// --- MÓDULO GENÉRICO CONFIGURACIONES ---
const ConfigurationListView = ({ title, items, setItems, prefix, labelName, labelValue }) => {
  const [newItem, setNewItem] = useState({ name: '', value: '' });
  const [modalType, setModalType] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [editData, setEditData] = useState({ name: '', value: '' });

  const getNextID = () => {
    const existingNums = items.map(t => parseInt(t.id.replace(prefix, ''), 10));
    let nextNum = 1;
    while (existingNums.includes(nextNum)) nextNum++;
    return `${prefix}${String(nextNum).padStart(6, '0')}`;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const cleanName = newItem.name.toUpperCase().trim();
    if (items.some(i => i.name === cleanName)) return;
    setItems([...items, { id: getNextID(), name: cleanName, value: parseFloat(newItem.value) || 0 }]);
    setNewItem({ name: '', value: '' });
  };

  const executeUpdate = () => {
    setItems(items.map(t => t.id === selectedItem.id ? { ...t, name: editData.name.toUpperCase().trim(), value: parseFloat(editData.value) || 0 } : t));
    setModalType(null);
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase">
      <div className="mb-6 md:mb-8 border-b-4 border-[#2596be] w-fit pb-2">
        <h2 className="text-xl md:text-2xl font-black text-[#134b60] tracking-[0.1em] md:tracking-[0.2em] uppercase">{title}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-6 rounded-3xl border-2 border-[#e9f4f8] shadow-sm h-fit">
          <h3 className="font-black text-[#134b60] mb-6 flex items-center gap-2 text-xs uppercase"><Plus size={18} className="text-[#2596be]" /> NUEVO REGISTRO</h3>
          <form className="space-y-5" onSubmit={handleAdd}>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">{labelName}</label>
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value.toUpperCase()})} placeholder="NOMBRE" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#2596be] outline-none font-bold text-sm uppercase text-[#134b60]" required />
            </div>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">{labelValue}</label>
              <input type="number" value={newItem.value} onChange={(e) => setNewItem({...newItem, value: e.target.value})} placeholder="0" className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#2596be] outline-none font-bold text-sm text-[#134b60]" required />
            </div>
            <button className="w-full bg-[#134b60] hover:bg-[#0f3c4c] text-white py-4 rounded-xl font-black uppercase text-[10px] transition-all">GUARDAR</button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#134b60] text-white text-[9px] uppercase font-black tracking-widest">
              <tr><th className="px-6 py-5">ID</th><th className="px-6 py-5">NOMBRE</th><th className="px-6 py-5 text-center">VALOR %</th><th className="px-6 py-5 text-right">GESTIÓN</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-[#134b60]">
              {items.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-300 font-black">SIN REGISTROS</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#e9f4f8]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[#2596be] font-black">{item.id}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4 text-center">{item.value}%</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedItem(item); setEditData({name: item.name, value: item.value}); setModalType('edit'); }} className="p-2 bg-[#e9f4f8] text-[#2596be] rounded-lg transition-all hover:bg-[#2596be] hover:text-white"><Edit size={14} /></button>
                        <button onClick={() => { setSelectedItem(item); setModalType('deleteFirst'); }} className="p-2 bg-rose-50 text-rose-500 rounded-lg transition-all hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modalType && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase overflow-y-auto print:hidden">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md ${modalType === 'deleteSecond' ? 'max-w-xl border-[6px] border-rose-500' : ''}`}>
            <div className="p-8 text-[#134b60]">
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className={`p-4 rounded-full ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#e9f4f8] text-[#2596be]' : 'bg-rose-50 text-rose-500'}`}>
                   {modalType === 'edit' ? <Edit size={40} /> : modalType === 'updateConfirm' ? <Info size={40} /> : <AlertTriangle size={40} />}
                </div>
                <h3 className="font-black text-xl uppercase tracking-tighter">
                  {modalType === 'edit' ? 'EDITAR REGISTRO' : modalType === 'updateConfirm' ? 'SISTEMA: CONFIRMAR' : 'ELIMINAR REGISTRO'}
                </h3>
              </div>
              <div className="space-y-4">
                {modalType === 'edit' && (
                  <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">NOMBRE</label><input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value.toUpperCase()})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black uppercase text-sm outline-none focus:border-[#2596be] transition-all text-[#134b60]" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">VALOR %</label><input type="number" value={editData.value} onChange={(e) => setEditData({...editData, value: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] transition-all text-[#134b60]" /></div>
                  </div>
                )}
                {modalType === 'updateConfirm' && <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl"><p className="text-indigo-700 font-black text-[10px] text-center leading-tight uppercase">⚠️ SE VA A REALIZAR UN CAMBIO Y SE AFECTARÁ A TODO EL SISTEMA.</p></div>}
                {modalType === 'deleteSecond' && <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl"><p className="text-rose-700 font-black text-xs text-center leading-relaxed uppercase">SE VA A REALIZAR UNA ACCIÓN QUE AFECTARÁ EL SISTEMA Y NO SE PODRÁ REVERTIR. ELIMINACIÓN TOTAL DE {selectedItem?.id}.</p></div>}
              </div>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-colors">CANCELAR</button>
                <button onClick={() => {
                   if (modalType === 'edit') setModalType('updateConfirm');
                   else if (modalType === 'updateConfirm') executeUpdate();
                   else if (modalType === 'deleteFirst') setModalType('deleteSecond');
                   else if (modalType === 'deleteSecond') { setItems(items.filter(i => i.id !== selectedItem.id)); setModalType(null); }
                }} className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#2596be] hover:bg-[#1e7a9b]' : 'bg-rose-600 hover:bg-rose-700'}`}>ACEPTAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// --- MÓDULO DE PRODUCTOS ---
const ProductsView = ({ products, setProducts, taxes, inventory, orders }) => {
const [csvPreview, setCsvPreview] = useState(null);
const [csvFileMeta, setCsvFileMeta] = useState({ name: '', size: '' });
  const getNextNumericID = () => {
    if (products.length === 0) return '00001';
    let max = 0;
    products.forEach(p => {
        const num = parseInt(p.id, 10);
        if (!isNaN(num) && num > max) max = num;
    });
    return String(max + 1).padStart(5, '0');
  };

  const initialForm = { id: getNextNumericID(), name: '', unitName: 'UNIDAD', taxId: '', cost: '', utility: '' };
  const [newProd, setNewProd] = useState(initialForm);
  const [modalType, setModalType] = useState(null);
  const [selectedProd, setSelectedProd] = useState(null);
  const [editData, setEditData] = useState(initialForm);
  const [errorMsg, setErrorMsg] = useState('');
  
  const unitOptions = ['UNIDAD', 'PAQUETE', 'CAJA', 'BOLSA'];

  const getCalculatedValues = (cost, utility, taxId) => {
    const c = parseFloat(cost) || 0;
    const u = parseFloat(utility) || 0;
    const taxValue = taxes.find(t => t.id === taxId)?.value || 0;
    const subtotal = c * (1 + (u / 100));
    const taxAmount = subtotal * (taxValue / 100);
    return { subtotal, taxAmount, finalPrice: subtotal + taxAmount };
  };

  const currentCalcs = getCalculatedValues(newProd.cost, newProd.utility, newProd.taxId);

 const handleAdd = async (e) => {
    e.preventDefault();
    const cleanName = newProd.name.toUpperCase().trim();
    if (products.some(p => p.id === newProd.id)) { setErrorMsg('ESTE CÓDIGO ID YA EXISTE'); return; }
    
    const taxObj = taxes.find(t => t.id === newProd.taxId);
    const nuevoProductoData = { 
        ...newProd, 
        name: cleanName, 
        taxName: taxObj?.name || '0%', 
        taxValue: taxObj?.value || 0 
    };

    try {
                
        // 2. Actualizar la tabla en la pantalla si se guardó con éxito
        setProducts([...products, nuevoProductoData]);
        setNewProd({ id: String(parseInt(newProd.id, 10) + 1).padStart(5, '0'), name: '', unitName: 'UNIDAD', taxId: '', cost: '', utility: '' }); 
        setErrorMsg('');
    } catch (error) {
        setErrorMsg('HUBO UN ERROR AL COMUNICARSE CON EL SERVIDOR');
    }
  };

  const executeUpdate = () => {
    const taxObj = taxes.find(t => t.id === editData.taxId);
    setProducts(products.map(p => p.id === selectedProd.id ? { 
        ...p,
        ...editData, 
        name: editData.name.toUpperCase().trim(),
        taxName: taxObj?.name || '0%',
        taxValue: taxObj?.value || 0
    } : p));
    setModalType(null);
  };

  // --- CSV CARGUE MASIVO PRODUCTOS ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado pesado. El límite máximo es 5 MB.");
      return;
    }

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(2)} KB`;

    setCsvFileMeta({ name: file.name, size: fileSizeFormatted });

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      
      const validRows = [];
      const errors = [];
      const seenIdsInFile = new Set();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [id, name, unit, cost, utility, taxPercentage] = line.split(/[,;]/);
        const cleanId = String(id || '').trim();
        const cleanName = String(name || '').trim();

        if (!cleanId || !cleanName) {
          errors.push(`Línea ${i + 1}: Falta el ID o el Nombre del producto.`);
          continue;
        }

        if (seenIdsInFile.has(cleanId)) {
          errors.push(`Línea ${i + 1}: El ID '${cleanId}' está duplicado en este archivo.`);
          continue;
        }
        seenIdsInFile.add(cleanId);

        // Validar si ya existe en la base de datos actual
        const existsInDB = products.some(p => p.id === cleanId.padStart(5, '0') || p.id === cleanId);
        if (existsInDB) {
          errors.push(`Línea ${i + 1}: El producto con ID '${cleanId}' ya existe en el sistema.`);
          continue;
        }

        const taxObj = taxes.find(t => t.value === parseFloat(taxPercentage)) || taxes[0];

        validRows.push({
          id: cleanId.padStart(5, '0'),
          name: cleanName.toUpperCase().substring(0, 100),
          unitName: unit ? unit.toUpperCase() : 'UNIDAD',
          taxId: taxObj?.id || '',
          taxName: taxObj?.name || '0%',
          taxValue: taxObj?.value || 0,
          cost: parseFloat(cost) || 0,
          utility: parseFloat(utility) || 0
        });
      }

      setCsvPreview({
        validRows,
        errors,
        totalFound: validRows.length + errors.length
      });
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "ID;NOMBRE;UNIDAD;COSTO;UTILIDAD;IMPUESTO_PORCENTAJE\n00001;PRODUCTO DE EJEMPLO 1;UNIDAD;10000;30;19\n00002;PRODUCTO DE EJEMPLO 2;CAJA;50000;20;5\n";
    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Plantilla_Maestra_Productos.csv";
    link.click();
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase gap-8">
      <div className="flex justify-between items-end border-b-4 border-[#2596be] pb-2">
        <h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase">GESTIÓN DE PRODUCTOS</h2>
        <button onClick={() => setModalType('bulkUpload')} className="bg-[#134b60] hover:bg-[#0f3c4c] text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg transition-all"><UploadCloud size={16}/> CARGUE MASIVO EXCEL</button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#e9f4f8] shadow-sm w-full">
        <h3 className="font-black text-[#134b60] mb-8 flex items-center gap-2 text-[11px] uppercase"><ShoppingCart size={18} className="text-[#2596be]" /> REGISTRO MANUAL DE PRODUCTO</h3>
        {errorMsg && <div className="mb-4 p-4 bg-rose-50 border-2 border-rose-200 text-rose-600 font-black text-[10px] rounded-xl animate-pulse">{errorMsg}</div>}
        <form className="space-y-6" onSubmit={handleAdd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
            <div className="space-y-1 lg:col-span-1">
              <label className="text-[9px] font-black text-[#2596be] uppercase tracking-widest">CÓDIGO ID (5 DÍGITOS)</label>
              <input type="text" maxLength={5} value={newProd.id} onChange={e => {const val = e.target.value.replace(/\D/g, ''); setNewProd({...newProd, id: val});}} className="w-full px-4 py-3 bg-[#e9f4f8] border-2 border-[#2596be]/30 rounded-xl outline-none font-black text-xs text-center text-[#134b60] focus:ring-4 focus:ring-[#2596be]/20" placeholder="00001" required />
            </div>
            
            <div className="space-y-1 lg:col-span-3 relative">
              <label className="text-[9px] font-black text-slate-400 uppercase">NOMBRE DEL PRODUCTO</label>
              <input type="text" maxLength={100} value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs text-[#134b60]" placeholder="DESCRIPCIÓN DETALLADA DEL PRODUCTO..." required />
              {newProd.name && newProd.name.length >= 100 && <span className="absolute -bottom-4 right-1 text-[8px] text-rose-500 font-black animate-pulse">Límite 100 alcanzado</span>}
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">U. MEDIDA</label>
              <select value={newProd.unitName} onChange={e => setNewProd({...newProd, unitName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer text-[#134b60]" required>
                 {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">IVA</label>
              <select value={newProd.taxId} onChange={e => setNewProd({...newProd, taxId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer text-[#134b60]">
                 <option value="">EXENTO</option>
                 {taxes.map(t => <option key={t.id} value={t.id}>{t.name} - {t.value}%</option>)}
              </select>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">COSTO ($)</label>
              <input type="number" value={newProd.cost} onChange={e => setNewProd({...newProd, cost: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs text-[#134b60]" required />
            </div>
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UTILIDAD (%)</label>
              <input type="number" value={newProd.utility} onChange={e => setNewProd({...newProd, utility: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs text-[#134b60]" required />
            </div>
            <button type="submit" className="lg:col-span-2 w-full bg-[#2596be] hover:bg-[#1e7a9b] text-white py-4 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-xl transition-all">REGISTRAR</button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border-2 border-slate-100 px-6 py-4 rounded-2xl"><p className="text-[8px] text-slate-400 font-black mb-1">COSTO + UTILIDAD</p><p className="text-lg font-black text-[#134b60]">{formatCurrency(currentCalcs.subtotal)}</p></div>
          <div className="bg-amber-50 border-2 border-amber-100 px-6 py-4 rounded-2xl"><p className="text-[8px] text-amber-500 font-black mb-1">VALOR IVA</p><p className="text-lg font-black text-amber-700">{formatCurrency(currentCalcs.taxAmount)}</p></div>
          <div className="bg-[#e9f4f8] px-6 py-4 rounded-2xl border-2 border-[#2596be]/30"><p className="text-[8px] text-[#2596be] font-black mb-1">PRECIO SUGERIDO FINAL</p><p className="text-xl font-black text-[#134b60]">{formatCurrency(currentCalcs.finalPrice)}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px] uppercase">
            <thead className="bg-[#134b60] text-white text-[9px] font-black"><tr><th className="px-6 py-6">ID CÓDIGO</th><th className="px-6 py-6">PRODUCTO / UNIDAD</th><th className="px-6 py-6 text-center">STOCK DISP.</th><th className="px-6 py-6 text-right">VALOR BASE</th><th className="px-6 py-6 text-right">IVA</th><th className="px-6 py-6 text-right">FINAL</th><th className="px-6 py-6 text-right">GESTIÓN</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-600">
              {products.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-20 text-center text-slate-300 font-black">CATÁLOGO VACÍO</td></tr>
              ) : (
                products.map(p => {
                  const c = getCalculatedValues(p.cost, p.utility, p.taxId);
                  const availableStock = calculateAvailableStock(p.id, inventory, orders);
                  return (
                    <tr key={p.id} className="hover:bg-[#e9f4f8]/50 transition-colors">
                      <td className="px-6 py-5 font-mono text-[#2596be] font-black">{p.id}</td>
                      <td className="px-6 py-5"><p className="font-black text-[#134b60]">{p.name}</p><p className="text-[9px] text-slate-400">{p.unitName}</p></td>
                      <td className="px-6 py-5 text-center"><div className={`px-4 py-1.5 rounded-full font-black font-mono text-xs inline-block ${availableStock > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>{availableStock.toFixed(2)}</div></td>
                      <td className="px-6 py-5 text-right font-mono text-slate-500">{formatCurrency(c.subtotal)}</td>
                      <td className="px-6 py-5 text-right font-mono text-amber-600">{formatCurrency(c.taxAmount)}</td>
                      <td className="px-6 py-5 text-right font-black text-[#134b60]">{formatCurrency(c.finalPrice)}</td>
                      <td className="px-6 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => { setSelectedProd(p); setEditData({ id: p.id, name: p.name, unitName: p.unitName, taxId: p.taxId, cost: p.cost, utility: p.utility }); setModalType('edit'); }} className="p-3 bg-[#e9f4f8] text-[#2596be] rounded-xl hover:bg-[#2596be] hover:text-white transition-all shadow-sm"><Edit size={16}/></button><button onClick={() => { setSelectedProd(p); setModalType('deleteFirst'); }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button></div></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalType === 'bulkUpload' && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center text-[#134b60]">
                <div className="w-20 h-20 bg-[#e9f4f8] text-[#2596be] rounded-full flex items-center justify-center mx-auto mb-6"><FileSpreadsheet size={40} /></div>
                <h3 className="font-black text-xl mb-2 tracking-tighter">CARGUE MASIVO (CSV)</h3>
                <p className="text-[10px] text-slate-400 font-bold mb-6">FORMATO ESPERADO: ID, NOMBRE, UNIDAD, COSTO, UTILIDAD, IVA(%)</p>
                
                <button onClick={downloadTemplate} className="w-full mb-6 py-3 border-2 border-[#2596be] text-[#2596be] rounded-xl font-black text-[10px] hover:bg-[#e9f4f8] transition-all uppercase flex items-center justify-center gap-2">
                    <Download size={14}/> DESCARGAR PLANTILLA MAESTRA DE EJEMPLO
                </button>

               {csvPreview ? (
  <div className="space-y-6 animate-in fade-in duration-300 w-full text-left">
    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase">ARCHIVO:</span>
        <span className="text-xs font-black text-[#134b60]">{csvFileMeta.name} ({csvFileMeta.size})</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase">REGISTROS VÁLIDOS:</span>
        <span className="text-xs font-black text-emerald-600">{csvPreview.validRows.length} listos para importar</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase">ERRORES / ADVERTENCIAS:</span>
        <span className={`text-xs font-black ${csvPreview.errors.length > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
          {csvPreview.errors.length} errores
        </span>
      </div>
    </div>

    {csvPreview.errors.length > 0 && (
      <div className="max-h-36 overflow-y-auto bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl space-y-1">
        <p className="text-[10px] font-black text-rose-600 uppercase mb-2">DETALLE DE FILAS IGNORADAS:</p>
        {csvPreview.errors.map((err, idx) => (
          <p key={idx} className="text-[9px] font-bold text-rose-700">{err}</p>
        ))}
      </div>
    )}

    <div className="flex gap-4 pt-2">
      <button 
        onClick={() => setCsvPreview(null)} 
        className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all"
      >
        CANCELAR
      </button>
      <button 
        onClick={() => {
          setProducts([...csvPreview.validRows, ...products]);
          setCsvPreview(null);
          setModalType(null); // Cierra el modal
        }} 
        disabled={csvPreview.validRows.length === 0}
        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-700 disabled:opacity-50 transition-all"
      >
        CONFIRMAR E IMPORTAR
      </button>
    </div>
  </div>
) : (
  <label className="block w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors mb-6 group">
    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
    <UploadCloud size={32} className="mx-auto text-slate-300 group-hover:text-[#2596be] mb-2 transition-colors"/>
    <span className="text-xs font-black text-slate-500 uppercase">SELECCIONAR ARCHIVO CSV</span>
  </label>
)}
                <button onClick={() => setModalType(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-200 uppercase">CANCELAR</button>
            </div>
        </div>
      )}

      {(modalType === 'edit' || modalType === 'updateConfirm' || modalType === 'deleteFirst' || modalType === 'deleteSecond') && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase overflow-y-auto print:hidden">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md ${modalType === 'deleteSecond' ? 'max-w-xl border-[6px] border-rose-500' : ''}`}>
            <div className="p-8 text-[#134b60]">
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className={`p-4 rounded-full ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#e9f4f8] text-[#2596be]' : 'bg-rose-50 text-rose-500'}`}>
                   {modalType === 'edit' ? <Edit size={40} /> : modalType === 'updateConfirm' ? <Info size={40} /> : <AlertTriangle size={40} />}
                </div>
                <h3 className="font-black text-xl uppercase tracking-tighter">
                  {modalType === 'edit' ? 'EDITAR PRODUCTO' : modalType === 'updateConfirm' ? 'SISTEMA: CONFIRMAR' : 'ELIMINAR PRODUCTO'}
                </h3>
              </div>
              <div className="space-y-4">
                {modalType === 'edit' && (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto px-2 py-1 scrollbar-hide">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400">CÓDIGO ID (SOLO LECTURA)</label>
                        <input type="text" value={editData.id} disabled className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl font-black text-sm text-center text-slate-400" />
                    </div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">NOMBRE PRODUCTO</label><input type="text" maxLength={100} value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value.toUpperCase()})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] text-[#134b60] transition-all uppercase" /></div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400">UNIDAD</label>
                      <select value={editData.unitName} onChange={(e) => setEditData({...editData, unitName: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] text-[#134b60] transition-all uppercase">
                         {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400">IVA</label>
                      <select value={editData.taxId} onChange={(e) => setEditData({...editData, taxId: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] text-[#134b60] transition-all uppercase">
                         <option value="">EXENTO</option>
                         {taxes.map(t => <option key={t.id} value={t.id}>{t.name} - {t.value}%</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">COSTO</label><input type="number" value={editData.cost} onChange={(e) => setEditData({...editData, cost: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] text-[#134b60] transition-all" /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">UTILIDAD %</label><input type="number" value={editData.utility} onChange={(e) => setEditData({...editData, utility: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] text-[#134b60] transition-all" /></div>
                    </div>
                  </div>
                )}
                {modalType === 'updateConfirm' && <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl"><p className="text-indigo-700 font-black text-[10px] text-center leading-tight uppercase">⚠️ SE VA A REALIZAR UN CAMBIO Y SE AFECTARÁ A TODO EL SISTEMA.</p></div>}
                {modalType === 'deleteSecond' && <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl"><p className="text-rose-700 font-black text-xs text-center leading-relaxed uppercase">SE VA A REALIZAR UNA ACCIÓN QUE AFECTARÁ EL SISTEMA Y NO SE PODRÁ REVERTIR. ELIMINACIÓN DE {selectedProd?.name}.</p></div>}
              </div>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-colors">CANCELAR</button>
                <button onClick={() => {
                   if (modalType === 'edit') setModalType('updateConfirm');
                   else if (modalType === 'updateConfirm') executeUpdate();
                   else if (modalType === 'deleteFirst') setModalType('deleteSecond');
                   else if (modalType === 'deleteSecond') { setProducts(products.filter(p => p.id !== selectedProd.id)); setModalType(null); }
                }} className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#2596be] hover:bg-[#1e7a9b]' : 'bg-rose-600 hover:bg-rose-700'}`}>ACEPTAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// --- MÓDULO DE INVENTARIO ---
const InventoryView = ({ inventory, setInventory, products, orders }) => {
  const [selectedProd, setSelectedProd] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [modalType, setModalType] = useState(null);
  const [filters, setFilters] = useState({ id: '', name: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [editData, setEditData] = useState({ quantity: '' });

  const filteredOptions = useMemo(() => {
    if (Object.values(filters).every(v => !v)) return [];
    return products.filter(p => 
      p.id.includes(filters.id) && 
      p.name.toUpperCase().includes(filters.name.toUpperCase())
    ).slice(0, 5);
  }, [filters, products]);

  const handleSave = () => {
    const id = `IV${String(inventory.length + 1).padStart(6, '0')}`;
    setInventory([{ id, productId: selectedProd.id, productName: selectedProd.name, unitName: selectedProd.unitName, quantity: parseFloat(quantity), date: new Date().toLocaleString(), user: 'ADMINISTRADOR' }, ...inventory]);
    setSelectedProd(null); setQuantity(''); setModalType(null); setFilters({ id: '', name: '' });
  };

  const executeUpdate = () => {
    setInventory(inventory.map(item => item.id === selectedItem.id ? { ...item, quantity: parseFloat(editData.quantity) || 0 } : item));
    setModalType(null);
  };

  // --- CSV CARGUE MASIVO INVENTARIO ---
 const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación de tamaño (ejemplo: máximo 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado pesado. El límite máximo es 5 MB.");
      return;
    }

    // Formatear el peso del archivo para mostrarlo (KB o MB)
    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(2)} KB`;

    setCsvFileMeta({ name: file.name, size: fileSizeFormatted });

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      
      const validRows = [];
      const errors = [];
      const seenCodesInFile = new Set(); // Para detectar IDs duplicados dentro del mismo archivo

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/[,;]/);
        if (parts.length < 2) {
          errors.hacia ? null : errors.push(`Línea ${i + 1}: Formato incompleto o mal separado.`);
          continue;
        }

        const [code, qty] = parts;
        const cleanCode = String(code || '').trim();
        const parsedQty = parseFloat(qty);

        // Validar si falta información o la cantidad no es válida
        if (!cleanCode || isNaN(parsedQty) || parsedQty <= 0) {
          errors.push(`Línea ${i + 1}: Código vacío o cantidad no válida.`);
          continue;
        }

        // Validar códigos duplicados dentro del mismo archivo CSV
        if (seenCodesInFile.has(cleanCode)) {
          errors.push(`Línea ${i + 1}: El código '${cleanCode}' está duplicado en este archivo.`);
          continue;
        }
        seenCodesInFile.add(cleanCode);

        // Buscar el producto en la base de datos general
        const prod = products.find(p => p.id === cleanCode.padStart(5, '0') || p.id === cleanCode);
        
        if (!prod) {
          errors.push(`Línea ${i + 1}: El código '${cleanCode}' no existe en la base de productos.`);
          continue;
        }

        validRows.push({
          productId: prod.id,
          productName: prod.name,
          unitName: prod.unitName,
          quantity: parsedQty,
          date: new Date().toLocaleString(),
          user: currentUser?.name || 'CARGUE MASIVO CSV'
        });
      }

      // Guardar todo en el estado de previsualización para mostrarlo en el modal
      setCsvPreview({
        validRows,
        errors,
        totalFound: validRows.length + errors.length
      });
    };

    reader.readAsText(file);
    e.target.value = ''; // Limpiar el input file para permitir re-subir el mismo archivo si es necesario
  };

  const downloadTemplate = () => {
    const csvContent = "CÓDIGO (ID);CANTIDAD\n00001;50\n00002;120\n";
    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Plantilla_Maestra_Inventario.csv";
    link.click();
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase gap-8">
      <div className="flex justify-between items-end border-b-4 border-[#2596be] pb-2">
        <h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase">CARGUE DE INVENTARIO</h2>
        <button onClick={() => setModalType('bulkUpload')} className="bg-[#134b60] hover:bg-[#0f3c4c] text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg transition-all"><UploadCloud size={16}/> CARGUE MASIVO EXCEL</button>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#e9f4f8] shadow-sm w-full relative">
        <h3 className="font-black text-[#134b60] mb-8 flex items-center gap-2 text-[11px] uppercase"><Boxes size={18} className="text-[#2596be]" /> BÚSQUEDA INTELIGENTE</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">CÓDIGO ID</label><input type="text" value={filters.id} onChange={e => {setFilters({...filters, id: e.target.value}); setSelectedProd(null);}} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase text-[#134b60]" placeholder="BUSCAR..." /></div>
          <div className="space-y-1 md:col-span-2"><label className="text-[9px] font-black text-slate-400 uppercase">PRODUCTO</label><input type="text" value={filters.name} onChange={e => {setFilters({...filters, name: e.target.value}); setSelectedProd(null);}} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase text-[#134b60]" placeholder="NOMBRE..." /></div>
          <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CANTIDAD</label><input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} disabled={!selectedProd} className="w-full px-4 py-3 bg-[#e9f4f8] text-[#134b60] border-2 border-[#2596be]/30 rounded-xl outline-none font-black text-xs text-center" placeholder="0.00" /></div>
        </div>
        {!selectedProd && filteredOptions.length > 0 && (
          <div className="absolute top-[160px] left-8 right-8 bg-white border-2 border-[#e9f4f8] shadow-2xl rounded-2xl z-[100] overflow-hidden">{filteredOptions.map(p => <button key={p.id} onClick={() => {setSelectedProd(p); setFilters({id: p.id, name: p.name});}} className="w-full text-left px-5 py-3 hover:bg-[#e9f4f8] border-b border-slate-50 flex justify-between items-center group transition-colors"><div className="flex gap-4 items-center"><div className="bg-slate-100 p-2 rounded-lg text-slate-500 font-mono text-[9px] font-bold">{p.id}</div><div><p className="text-[10px] font-black text-[#134b60] uppercase">{p.name}</p><p className="text-[8px] text-slate-400 font-bold uppercase">{p.unitName}</p></div></div><Plus size={16} className="text-[#2596be] opacity-0 group-hover:opacity-100" /></button>)}</div>
        )}
        <button onClick={() => setModalType('confirm')} disabled={!selectedProd || !quantity} className="w-full bg-[#2596be] text-white py-5 rounded-xl font-black hover:bg-[#1e7a9b] transition-all text-xs uppercase shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"><ArrowUpRight size={20} /> PROCESAR CARGUE</button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1300px] uppercase">
            <thead className="bg-[#134b60] text-white text-[9px] font-black uppercase tracking-widest"><tr><th className="px-6 py-6">ID MOV.</th><th className="px-6 py-6">CÓDIGO ID</th><th className="px-6 py-6">PRODUCTO</th><th className="px-6 py-6 text-center">CANTIDAD</th><th className="px-6 py-6 text-center">FECHA / HORA</th><th className="px-6 py-6 text-center">USUARIO</th><th className="px-6 py-6 text-right">GESTIÓN</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-[#134b60]">
              {inventory.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-300 font-black">HISTORIAL VACÍO</td></tr>
              ) : (
                inventory.map(ev => (<tr key={ev.id} className="hover:bg-[#e9f4f8]/50 transition-colors"><td className="px-6 py-5 font-mono text-slate-400">{ev.id}</td><td className="px-6 py-5 font-mono text-[#2596be] font-black">{ev.productId}</td><td className="px-6 py-5"><p className="font-black text-[#134b60]">{ev.productName}</p><p className="text-[9px] text-slate-400">{ev.unitName}</p></td><td className="px-6 py-5 text-center font-mono text-emerald-600">{ev.quantity}</td><td className="px-6 py-5 text-center text-slate-400 text-[10px]">{ev.date}</td><td className="px-6 py-5 text-center text-[9px] font-black text-slate-500">{ev.user}</td><td className="px-6 py-5 text-right flex justify-end gap-2"><button onClick={() => { setSelectedItem(ev); setEditData({ quantity: ev.quantity }); setModalType('edit'); }} className="p-3 bg-[#e9f4f8] text-[#2596be] rounded-xl hover:bg-[#2596be] hover:text-white transition-all shadow-sm"><Edit size={16}/></button><button onClick={() => { setSelectedItem(ev); setModalType('deleteFirst'); }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button></td></tr>))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalType === 'bulkUpload' && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center text-[#134b60]">
                <div className="w-20 h-20 bg-[#e9f4f8] text-[#2596be] rounded-full flex items-center justify-center mx-auto mb-6"><FileSpreadsheet size={40} /></div>
                <h3 className="font-black text-xl mb-2 tracking-tighter">CARGUE MASIVO INVENTARIO (CSV)</h3>
                <p className="text-[10px] text-slate-400 font-bold mb-6">FORMATO ESPERADO: CÓDIGO_ID, CANTIDAD</p>
                
                <button onClick={downloadTemplate} className="w-full mb-6 py-3 border-2 border-[#2596be] text-[#2596be] rounded-xl font-black text-[10px] hover:bg-[#e9f4f8] transition-all uppercase flex items-center justify-center gap-2">
                    <Download size={14}/> DESCARGAR PLANTILLA MAESTRA DE EJEMPLO
                </button>

                <label className="block w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors mb-6 group">
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    <UploadCloud size={32} className="mx-auto text-slate-300 group-hover:text-[#2596be] mb-2 transition-colors"/>
                    <span className="text-xs font-black text-slate-500 uppercase">SELECCIONAR ARCHIVO CSV</span>
                </label>
                <button onClick={() => setModalType(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-200 uppercase">CANCELAR</button>
            </div>
        </div>
      )}

      {modalType === 'confirm' && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8 text-center text-[#134b60]">
            <div className="w-20 h-20 bg-[#e9f4f8] text-[#2596be] rounded-full flex items-center justify-center mx-auto mb-6"><Boxes size={40}/></div>
            <h3 className="font-black text-xl mb-4">¿CONFIRMAR CARGUE?</h3>
            <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl mb-8">
              <p className="text-emerald-500 text-4xl font-black font-mono">{quantity} <span className="text-xs text-slate-400">{selectedProd?.unitName}</span></p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">DISPONIBLE ACTUAL: {selectedProd && calculateAvailableStock(selectedProd.id, inventory, orders)}</p>
            </div>
            <div className="flex gap-4"><button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase hover:bg-slate-50">VOLVER</button><button onClick={handleSave} className="flex-1 py-4 bg-[#2596be] text-white rounded-xl font-black text-xs shadow-xl hover:bg-[#1e7a9b] uppercase">ACEPTAR</button></div>
          </div>
        </div>
      )}
      {(modalType === 'edit' || modalType === 'updateConfirm' || modalType === 'deleteFirst' || modalType === 'deleteSecond') && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase overflow-y-auto print:hidden">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md ${modalType === 'deleteSecond' ? 'max-w-xl border-[6px] border-rose-500' : ''}`}>
            <div className="p-8 text-[#134b60]">
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className={`p-4 rounded-full ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#e9f4f8] text-[#2596be]' : 'bg-rose-50 text-rose-500'}`}>
                   {modalType === 'edit' ? <Edit size={40} /> : modalType === 'updateConfirm' ? <Info size={40} /> : <AlertTriangle size={40} />}
                </div>
                <h3 className="font-black text-xl uppercase tracking-tighter">
                  {modalType === 'edit' ? 'EDITAR CANTIDAD' : modalType === 'updateConfirm' ? 'SISTEMA: CONFIRMAR' : 'ELIMINAR REGISTRO'}
                </h3>
              </div>
              <div className="space-y-4">
                {modalType === 'edit' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400">NUEVA CANTIDAD</label>
                    <input type="number" step="0.01" value={editData.quantity} onChange={(e) => setEditData({...editData, quantity: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-center text-sm outline-none focus:border-[#2596be] text-[#134b60] transition-all" />
                  </div>
                )}
                {modalType === 'updateConfirm' && <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl"><p className="text-indigo-700 font-black text-[10px] text-center uppercase">⚠️ SE VA A REALIZAR UN CAMBIO Y SE AFECTARÁ AL STOCK GENERAL.</p></div>}
                {modalType === 'deleteSecond' && <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl"><p className="text-rose-700 font-black text-xs text-center uppercase">SE VA A REALIZAR UNA ACCIÓN QUE AFECTARÁ AL STOCK Y NO SE PODRÁ REVERTIR. ELIMINACIÓN DEL REGISTRO {selectedItem?.id}.</p></div>}
              </div>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-colors">CANCELAR</button>
                <button onClick={() => {
                   if (modalType === 'edit') setModalType('updateConfirm');
                   else if (modalType === 'updateConfirm') executeUpdate();
                   else if (modalType === 'deleteFirst') setModalType('deleteSecond');
                   else if (modalType === 'deleteSecond') { setInventory(inventory.filter(i => i.id !== selectedItem.id)); setModalType(null); }
                }} className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#2596be] hover:bg-[#1e7a9b]' : 'bg-rose-600 hover:bg-rose-700'}`}>ACEPTAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// --- MÓDULO DE CLIENTES ---
const ClientsView = ({ clients, setClients, clientTypes }) => {
  const initialForm = { name: '', docType: 'NIT', docNumber: '', typeId: '', email: '', phone: '', extension: '', mobile: '', address: '', contact: '' };
  const [newClient, setNewClient] = useState(initialForm);
  const [modalType, setModalType] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editData, setEditData] = useState(initialForm);

  const getNextID = () => `CL${String(clients.length + 1).padStart(6, '0')}`;

  const handleAdd = (e) => {
    e.preventDefault();
    const typeObj = clientTypes.find(t => t.id === newClient.typeId);
    setClients([...clients, { ...newClient, id: getNextID(), typeName: typeObj?.name || 'S.T', name: newClient.name.toUpperCase() }]);
    setNewClient(initialForm);
  };

  const executeUpdate = () => {
    const typeObj = clientTypes.find(t => t.id === editData.typeId);
    setClients(clients.map(c => c.id === selectedClient.id ? { 
        ...c, 
        ...editData, 
        name: editData.name.toUpperCase().trim(),
        typeName: typeObj?.name || 'S.T'
    } : c));
    setModalType(null);
  };

  const InputWarning = ({ val, max }) => {
    if (val && val.toString().length >= max) {
      return <span className="absolute -bottom-4 right-1 text-[8px] text-rose-500 font-black animate-pulse uppercase">Límite {max} alcanzado</span>;
    }
    return null;
  };

  const getInputClass = (val, max) => `w-full px-4 py-3 bg-slate-50 border-2 rounded-xl outline-none font-bold text-xs transition-all uppercase text-[#134b60] ${val && val.toString().length >= max ? 'border-rose-400 focus:border-rose-500 bg-rose-50' : 'border-transparent focus:border-[#2596be]'}`;

  const handleNumChange = (val, field, isEdit) => {
    const numericVal = val.replace(/\D/g, '');
    if (isEdit) setEditData({ ...editData, [field]: numericVal });
    else setNewClient({ ...newClient, [field]: numericVal });
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase gap-8">
      <div className="border-b-4 border-[#2596be] w-fit pb-2"><h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase">GESTIÓN DE CLIENTES</h2></div>
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#e9f4f8] shadow-sm w-full">
        <h3 className="font-black text-[#134b60] mb-8 flex items-center gap-2 text-[11px] uppercase"><UserPlus size={18} className="text-[#2596be]" /> REGISTRO DE CLIENTE</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6 items-end" onSubmit={handleAdd}>
          <div className="md:col-span-2 space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">NOMBRE / RAZÓN SOCIAL</label>
            <input type="text" maxLength={40} value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value.toUpperCase()})} className={getInputClass(newClient.name, 40)} required />
            <InputWarning val={newClient.name} max={40} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400">DOC. TIPO</label>
            <select value={newClient.docType} onChange={e => setNewClient({...newClient, docType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] text-[#134b60] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer">
              <option value="NIT">NIT</option>
              <option value="CC">CÉDULA CIUDADANÍA</option>
              <option value="CE">CÉDULA EXTRANJERÍA</option>
              <option value="RUT">RUT</option>
            </select>
          </div>
          <div className="space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">NÚMERO</label>
            <input type="text" maxLength={15} value={newClient.docNumber} onChange={e => handleNumChange(e.target.value, 'docNumber', false)} className={getInputClass(newClient.docNumber, 15)} required />
            <InputWarning val={newClient.docNumber} max={15} />
          </div>
          
          <div className="md:col-span-2 space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">EMAIL</label>
            <input type="email" maxLength={50} pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className={getInputClass(newClient.email, 50).replace('uppercase', 'lowercase')} required placeholder="ejemplo@dominio.com" />
            <InputWarning val={newClient.email} max={50} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400">TIPO CLIENTE</label>
            <select value={newClient.typeId} onChange={e => setNewClient({...newClient, typeId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] text-[#134b60] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer" required>
              <option value="">SELECCIONE</option>{clientTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.value}%)</option>)}
            </select>
          </div>
          <div className="space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">TELÉFONO</label>
            <input type="text" maxLength={15} value={newClient.phone} onChange={e => handleNumChange(e.target.value, 'phone', false)} className={getInputClass(newClient.phone, 15)} required />
            <InputWarning val={newClient.phone} max={15} />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">EXTENSIÓN (OPC.)</label>
            <input type="text" maxLength={5} value={newClient.extension} onChange={e => handleNumChange(e.target.value, 'extension', false)} className={getInputClass(newClient.extension, 5)} />
            <InputWarning val={newClient.extension} max={5} />
          </div>
          <div className="space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">CELULAR</label>
            <input type="text" maxLength={15} value={newClient.mobile} onChange={e => handleNumChange(e.target.value, 'mobile', false)} className={getInputClass(newClient.mobile, 15)} required />
            <InputWarning val={newClient.mobile} max={15} />
          </div>
          <div className="md:col-span-2 space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">DIRECCIÓN</label>
            <input type="text" maxLength={50} value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value.toUpperCase()})} className={getInputClass(newClient.address, 50)} required />
            <InputWarning val={newClient.address} max={50} />
          </div>

          <div className="md:col-span-2 space-y-1 relative">
            <label className="text-[9px] font-black text-slate-400">PERSONA DE CONTACTO (OPC.)</label>
            <input type="text" maxLength={20} value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value.toUpperCase()})} className={getInputClass(newClient.contact, 20)} />
            <InputWarning val={newClient.contact} max={20} />
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="w-full bg-[#2596be] hover:bg-[#1e7a9b] text-white py-4 rounded-xl font-black text-[10px] shadow-xl transition-all active:scale-95 tracking-widest flex justify-center items-center gap-2"><Plus size={16} /> REGISTRAR CLIENTE</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px] uppercase">
            <thead className="bg-[#134b60] text-white text-[9px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-6">ID</th>
                <th className="px-6 py-6">CLIENTE</th>
                <th className="px-6 py-6">DOCUMENTO</th>
                <th className="px-6 py-6">CONTACTO</th>
                <th className="px-6 py-6 text-center">TIPO</th>
                <th className="px-6 py-6 text-right">GESTIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-[#134b60]">
              {clients.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-300 font-black">SIN CLIENTES</td></tr>
              ) : (
                clients.map(c => (
                  <tr key={c.id} className="hover:bg-[#e9f4f8]/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-[#2596be]">{c.id}</td>
                    <td className="px-6 py-5">
                      <p className="font-black text-[#134b60]">{c.name}</p>
                      <p className="text-[9px] text-slate-400 lowercase">{c.email}</p>
                    </td>
                    <td className="px-6 py-5 font-mono">{c.docNumber} <span className="text-[9px] text-slate-400 font-sans">({c.docType})</span></td>
                    <td className="px-6 py-5 font-mono">
                      <p className="text-slate-600"><span className="text-[9px] text-slate-400 font-sans">CEL:</span> {c.mobile}</p>
                      <p className="text-[10px] text-slate-400"><span className="text-[9px] text-slate-400 font-sans">TEL:</span> {c.phone} {c.extension && `EXT: ${c.extension}`}</p>
                    </td>
                    <td className="px-6 py-5 text-center"><span className="bg-[#e9f4f8] text-[#2596be] px-3 py-1.5 rounded-lg text-[9px] border border-[#2596be]/20">{c.typeName}</span></td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedClient(c); setEditData(c); setModalType('edit'); }} className="p-3 bg-[#e9f4f8] text-[#2596be] rounded-xl hover:bg-[#2596be] hover:text-white transition-all shadow-sm"><Edit size={16}/></button>
                        <button onClick={() => { setSelectedClient(c); setModalType('deleteFirst'); }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modalType === 'edit' || modalType === 'updateConfirm' || modalType === 'deleteFirst' || modalType === 'deleteSecond') && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase overflow-y-auto print:hidden">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full ${modalType === 'deleteSecond' ? 'max-w-xl border-[6px] border-rose-500' : 'max-w-4xl'}`}>
            <div className="p-8 text-[#134b60]">
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className={`p-4 rounded-full ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#e9f4f8] text-[#2596be]' : 'bg-rose-50 text-rose-500'}`}>
                   {modalType === 'edit' ? <Edit size={40} /> : modalType === 'updateConfirm' ? <Info size={40} /> : <AlertTriangle size={40} />}
                </div>
                <h3 className="font-black text-xl uppercase tracking-tighter">
                  {modalType === 'edit' ? 'EDITAR CLIENTE' : modalType === 'updateConfirm' ? 'SISTEMA: CONFIRMAR' : 'ELIMINAR CLIENTE'}
                </h3>
              </div>
              <div className="space-y-4">
                {modalType === 'edit' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 max-h-[50vh] overflow-y-auto px-2 py-2 scrollbar-hide">
                    <div className="md:col-span-2 space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">NOMBRE / RAZÓN SOCIAL</label>
                      <input type="text" maxLength={40} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value.toUpperCase()})} className={getInputClass(editData.name, 40)} required />
                      <InputWarning val={editData.name} max={40} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400">DOC. TIPO</label>
                      <select value={editData.docType} onChange={e => setEditData({...editData, docType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer text-[#134b60]">
                        <option value="NIT">NIT</option>
                        <option value="CC">CÉDULA CIUDADANÍA</option>
                        <option value="CE">CÉDULA EXTRANJERÍA</option>
                        <option value="RUT">RUT</option>
                      </select>
                    </div>
                    <div className="space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">NÚMERO</label>
                      <input type="text" maxLength={15} value={editData.docNumber} onChange={e => handleNumChange(e.target.value, 'docNumber', true)} className={getInputClass(editData.docNumber, 15)} required />
                      <InputWarning val={editData.docNumber} max={15} />
                    </div>
                    
                    <div className="md:col-span-2 space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">EMAIL</label>
                      <input type="email" maxLength={50} pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className={getInputClass(editData.email, 50).replace('uppercase', 'lowercase')} required />
                      <InputWarning val={editData.email} max={50} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400">TIPO CLIENTE</label>
                      <select value={editData.typeId} onChange={e => setEditData({...editData, typeId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer text-[#134b60]" required>
                        <option value="">SELECCIONE</option>{clientTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">TELÉFONO</label>
                      <input type="text" maxLength={15} value={editData.phone} onChange={e => handleNumChange(e.target.value, 'phone', true)} className={getInputClass(editData.phone, 15)} required />
                      <InputWarning val={editData.phone} max={15} />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">EXTENSIÓN (OPC.)</label>
                      <input type="text" maxLength={5} value={editData.extension} onChange={e => handleNumChange(e.target.value, 'extension', true)} className={getInputClass(editData.extension, 5)} />
                      <InputWarning val={editData.extension} max={5} />
                    </div>
                    <div className="space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">CELULAR</label>
                      <input type="text" maxLength={15} value={editData.mobile} onChange={e => handleNumChange(e.target.value, 'mobile', true)} className={getInputClass(editData.mobile, 15)} required />
                      <InputWarning val={editData.mobile} max={15} />
                    </div>
                    <div className="md:col-span-2 space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">DIRECCIÓN</label>
                      <input type="text" maxLength={50} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value.toUpperCase()})} className={getInputClass(editData.address, 50)} required />
                      <InputWarning val={editData.address} max={50} />
                    </div>

                    <div className="md:col-span-2 space-y-1 relative">
                      <label className="text-[9px] font-black text-slate-400">PERSONA DE CONTACTO (OPC.)</label>
                      <input type="text" maxLength={20} value={editData.contact} onChange={e => setEditData({...editData, contact: e.target.value.toUpperCase()})} className={getInputClass(editData.contact, 20)} />
                      <InputWarning val={editData.contact} max={20} />
                    </div>
                  </div>
                )}
                {modalType === 'updateConfirm' && <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl"><p className="text-indigo-700 font-black text-[10px] text-center uppercase">⚠️ SE VA A REALIZAR UN CAMBIO Y SE AFECTARÁ A TODO EL SISTEMA.</p></div>}
                {modalType === 'deleteSecond' && <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl"><p className="text-rose-700 font-black text-xs text-center uppercase">SE VA A REALIZAR UNA ACCIÓN QUE AFECTARÁ EL SISTEMA Y NO SE PODRÁ REVERTIR. ELIMINACIÓN DE {selectedClient?.name}.</p></div>}
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-colors">CANCELAR</button>
                <button onClick={() => {
                   if (modalType === 'edit') setModalType('updateConfirm');
                   else if (modalType === 'updateConfirm') executeUpdate();
                   else if (modalType === 'deleteFirst') setModalType('deleteSecond');
                   else if (modalType === 'deleteSecond') { setClients(clients.filter(c => c.id !== selectedClient.id)); setModalType(null); }
                }} className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#2596be] hover:bg-[#1e7a9b]' : 'bg-rose-600 hover:bg-rose-700'}`}>ACEPTAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// --- MÓDULO DE SOLICITUD DE PEDIDO ---
const ClientNewOrderView = ({ products, orders, setOrders, currentUser, clients, clientTypes, inventory }) => {
  const [adminOrderClient, setAdminOrderClient] = useState('');
  const [cart, setCart] = useState([]);
  const [searchID, setSearchID] = useState('');
  const [searchName, setSearchName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [observation, setObservation] = useState('');
  const [selectedProd, setSelectedProd] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);

  const activeClientRecord = currentUser.role === 'ADMIN' ? clients.find(c => c.id === adminOrderClient) : clients.find(c => c.id === currentUser.relatedId);
  const activeClientType = clientTypes.find(ct => ct.id === activeClientRecord?.typeId);
  const customUtility = activeClientType ? parseFloat(activeClientType.value) : null;
  const isSearchDisabled = currentUser.role === 'ADMIN' && !adminOrderClient;

  const filteredProducts = useMemo(() => {
    if (!searchName || selectedProd?.name === searchName) return [];
    return products.filter(p => p.name.toUpperCase().includes(searchName.toUpperCase())).slice(0, 5);
  }, [searchName, products, selectedProd]);

  const filteredIDs = useMemo(() => {
    if (!searchID || selectedProd?.id === searchID) return [];
    return products.filter(p => p.id.includes(searchID)).slice(0, 5);
  }, [searchID, products, selectedProd]);

  const financialData = useMemo(() => {
    if (!selectedProd) return { base: 0, iva: 0, totalUnit: 0, selectionTotal: 0 };
    const utilityToUse = customUtility !== null ? customUtility : parseFloat(selectedProd.utility);
    const base = parseFloat(selectedProd.cost) * (1 + (utilityToUse / 100));
    const iva = base * ((parseFloat(selectedProd.taxValue) || 0) / 100);
    const totalUnit = base + iva;
    const q = parseFloat(quantity) || 0;
    return { base, iva, totalUnit, selectionTotal: totalUnit * q };
  }, [selectedProd, quantity, customUtility]);

  const cartFinancials = useMemo(() => cart.reduce((acc, item) => acc + (item.totalPricePerUnit * item.quantity), 0), [cart]);

  const availableStock = selectedProd ? calculateAvailableStock(selectedProd.id, inventory, orders) - cart.filter(c => c.productId === selectedProd.id).reduce((sum, c) => sum + c.quantity, 0) : 0;
  const isOverStock = selectedProd && parseFloat(quantity) > availableStock;

  const handleProductSelect = (prod) => {
    setSearchID(prod.id);
    setSearchName(prod.name);
    setSelectedProd(prod);
  };

const resetSearchState = () => { setSearchID(''); setSearchName(''); setQuantity(''); setSelectedProd(null); setObservation(''); };

  const handleAddToOrder = (e) => {
    e.preventDefault();
    if (!selectedProd || !quantity || parseFloat(quantity) <= 0) return;
    if (parseFloat(quantity) > availableStock) { alert(`STOCK INSUFICIENTE. DISPONIBLE ACTUAL: ${availableStock}`); return; }

    const existing = cart.find(c => c.productId === selectedProd.id);
    if (existing) { 
      setCart(cart.map(c => c.productId === selectedProd.id ? { 
        ...c, 
        quantity: c.quantity + parseFloat(quantity),
        observation: observation ? (c.observation ? `${c.observation} | ${observation.toUpperCase()}` : observation.toUpperCase()) : c.observation
      } : c)); 
    }
    else { 
        setCart([...cart, { 
            tempId: Date.now(), 
            productId: selectedProd.id, 
            name: selectedProd.name, 
            unit: selectedProd.unitName, 
            quantity: parseFloat(quantity), 
            taxValue: selectedProd.taxValue, 
            totalPricePerUnit: financialData.totalUnit,
            observation: observation.toUpperCase()
        }]); 
    }
    resetSearchState();
  };

  const saveOrder = () => {
    const nextID = `SO${String(orders.length + 1).padStart(6, '0')}`;
    const clientNameToSave = activeClientRecord ? activeClientRecord.name : currentUser.name;
    const clientDocType = activeClientRecord ? activeClientRecord.docType : 'NIT';
    const clientDocNumber = activeClientRecord ? activeClientRecord.docNumber : 'N/A';
    const clientAddress = activeClientRecord ? activeClientRecord.address : 'NO REGISTRADA';
    const clientPhone = activeClientRecord ? activeClientRecord.mobile || activeClientRecord.phone : 'NO REGISTRADO';
    const clientEmail = activeClientRecord ? activeClientRecord.email : currentUser.email;

    const newOrder = { 
        id: nextID, 
        clientName: clientNameToSave, 
        clientDocType,
        clientDocNumber,
        clientAddress,
        clientPhone,
        clientEmail,
        date: new Date().toLocaleString(), 
        status: 'NUEVA', 
        globalDiscount: 0, // Inicializado en 0 para los descuentos globales
        items: cart.map(item => ({ ...item, discount: 0 })), // Cada ítem nace con 0% de descuento
        totalItems: cart.length, 
        totalValue: cartFinancials 
    };

    setOrders([newOrder, ...orders]);
    setCart([]); 
    setLastSavedOrder(newOrder);
    setModalType('orderSuccess');
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase gap-8">
      <div className="border-b-4 border-[#2596be] w-fit pb-2"><h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase">NUEVA SOLICITUD DE PEDIDO</h2></div>
      
      {currentUser.role === 'ADMIN' && (
        <div className="bg-[#e9f4f8] p-6 rounded-3xl border-2 border-[#2596be]/20 shadow-sm w-full">
          <h3 className="font-black text-[#134b60] mb-4 flex items-center gap-2 text-[11px] uppercase"><UserCircle size={18} className="text-[#2596be]" /> SELECCIONAR CLIENTE A FACTURAR (SOLO MODO ADMIN)</h3>
          <select value={adminOrderClient} onChange={e => setAdminOrderClient(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase text-[#134b60]">
             <option value="">SELECCIONE UN CLIENTE PRIMERO...</option>
             {clients.map(c => <option key={c.id} value={c.id}>{c.docNumber} - {c.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm"><p className="text-[8px] text-slate-500 font-black mb-1">VALOR BASE</p><p className="text-lg font-black text-[#134b60]">{formatCurrency(financialData.base)}</p></div>
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-200 shadow-sm"><p className="text-[8px] text-indigo-500 font-black mb-1">IVA UNITARIO</p><p className="text-lg font-black text-indigo-800">{formatCurrency(financialData.iva)}</p></div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-sm"><p className="text-[8px] text-emerald-500 font-black mb-1">TOTAL UNITARIO</p><p className="text-lg font-black text-emerald-800">{formatCurrency(financialData.totalUnit)}</p></div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm"><p className="text-[8px] text-amber-600 font-black mb-1">COSTO SELECCIÓN</p><p className="text-lg font-black text-amber-800">{formatCurrency(financialData.selectionTotal)}</p></div>
        <div className="bg-[#e9f4f8] p-6 rounded-3xl border border-[#2596be]/30 shadow-sm relative overflow-hidden">
            <p className="text-[8px] text-[#2596be] font-black mb-1">TOTAL ACUMULADO</p><p className="text-lg font-black text-[#134b60]">{formatCurrency(cartFinancials)}</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#e9f4f8] shadow-sm w-full relative">
        {isSearchDisabled && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl"><p className="bg-[#134b60] text-white px-6 py-3 rounded-full font-black text-xs uppercase shadow-xl animate-pulse">SELECCIONE UN CLIENTE ARRIBA PARA COMENZAR</p></div>}
        <h3 className="font-black text-[#134b60] mb-8 flex items-center gap-2 text-[11px] uppercase"><ShoppingCart size={18} className="text-[#2596be]" /> BÚSQUEDA TÉCNICA</h3>
        <form className="space-y-6" onSubmit={handleAddToOrder}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-black text-[#2596be] uppercase tracking-widest">CÓDIGO (ID)</label>
              <div className="relative"><Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={searchID} disabled={isSearchDisabled} onChange={e => {setSearchID(e.target.value); setSelectedProd(null);}} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-black text-xs uppercase text-[#134b60] disabled:opacity-50" placeholder="EJ: 00001" />
                {filteredIDs.length > 0 && !selectedProd && (<div className="absolute top-full left-0 right-0 bg-white border-2 border-slate-100 shadow-2xl rounded-2xl mt-1 z-[60] overflow-hidden">{filteredIDs.map(p => <button key={p.id} type="button" onClick={() => handleProductSelect(p)} className="w-full text-left px-4 py-3 hover:bg-[#e9f4f8] text-[10px] font-black uppercase border-b border-slate-50 text-[#134b60]">{p.id} - {p.name}</button>)}</div>)}
              </div>
            </div>
            
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PRODUCTO (NOMBRE)</label>
              <div className="relative">
                <input type="text" value={searchName} disabled={isSearchDisabled} onChange={e => {setSearchName(e.target.value); setSelectedProd(null);}} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase text-[#134b60] disabled:opacity-50" placeholder="BUSCAR POR NOMBRE..." />
                {filteredProducts.length > 0 && !selectedProd && (<div className="absolute top-full left-0 right-0 bg-white border-2 border-slate-100 shadow-2xl rounded-2xl mt-1 z-[60] overflow-hidden">{filteredProducts.map(p => <button key={p.id} type="button" onClick={() => handleProductSelect(p)} className="w-full text-left px-4 py-3 hover:bg-[#e9f4f8] text-[10px] font-black uppercase border-b border-slate-50 text-[#134b60]">{p.name}</button>)}</div>)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-1">
              <label className={`text-[9px] font-black uppercase tracking-widest ${isOverStock ? 'text-rose-500' : 'text-[#2596be]'}`}>CANTIDAD {selectedProd && `(DISP: ${availableStock})`}</label>
              <div className="relative">
                <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="number" step="0.01" disabled={!selectedProd || isSearchDisabled} value={quantity} onChange={e => setQuantity(e.target.value)} className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none font-black text-xl text-center disabled:opacity-30 focus:ring-4 focus:ring-[#2596be]/20 transition-all ${isOverStock ? 'bg-rose-50 border-2 border-rose-400 text-rose-600' : 'bg-slate-50 border-2 border-slate-100 text-[#134b60]'}`} placeholder="0.00" required />
              </div>
            </div>
            
            <div className="space-y-1 relative">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OBSERVACIÓN (OPCIONAL)</label>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" maxLength={50} disabled={!selectedProd || isSearchDisabled} value={observation} onChange={e => setObservation(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase text-[#134b60] disabled:opacity-30 transition-all" placeholder="EJ: EMPAQUE DOBLE..." />
              </div>
              {observation.length >= 50 && <span className="absolute -bottom-4 right-1 text-[8px] text-rose-500 font-black animate-pulse uppercase">Límite 50 alcanzado</span>}
            </div>

            <button type="submit" disabled={!selectedProd || !quantity || isSearchDisabled || isOverStock} className="w-full bg-[#2596be] text-white font-black rounded-xl hover:bg-[#1e7a9b] transition-all text-xs uppercase shadow-xl shadow-[#2596be]/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 h-[56px] self-end">
              <Plus size={20} /> AGREGAR
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden w-full flex flex-col">
        <div className="p-6 border-b border-[#e9f4f8] flex justify-between items-center bg-[#e9f4f8]/30"><h4 className="text-[10px] font-black text-[#2596be] uppercase tracking-tighter">PRE-RESUMEN DE SOLICITUD</h4></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px] uppercase">
            <thead className="bg-[#134b60] text-white text-[9px] font-black uppercase"><tr><th className="px-6 py-5">CÓDIGO (ID)</th><th className="px-6 py-5">PRODUCTO</th><th className="px-6 py-5 text-center">U. MEDIDA</th><th className="px-6 py-5 text-center">CANTIDAD</th><th className="px-6 py-5 text-right">UNITARIO</th><th className="px-6 py-5 text-right">SUBTOTAL</th><th className="px-6 py-5 text-right">GESTIÓN</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-[#134b60]">
              {cart.length === 0 ? (<tr><td colSpan="7" className="px-6 py-10 text-center text-slate-300 font-black">CARRITO VACÍO</td></tr>) : (
                cart.map(item => (<tr key={item.tempId} className="hover:bg-[#e9f4f8]/50 transition-colors"><td className="px-6 py-4 font-mono text-[#2596be]">{item.productId}</td><td className="px-6 py-4">
  <p className="font-black text-[#134b60]">{item.name}</p>
  {item.observation && <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase">NOTA: {item.observation}</p>}
</td><td className="px-6 py-4 text-center font-black">{item.unit}</td><td className="px-6 py-4 text-center font-mono">{item.quantity}</td><td className="px-6 py-4 text-right text-slate-500 font-mono">{formatCurrency(item.totalPricePerUnit)}</td><td className="px-6 py-4 text-right text-emerald-600 font-black font-mono">{formatCurrency(item.totalPricePerUnit * item.quantity)}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => { setEditItem(item); setModalType('editCart'); }} className="p-2 bg-[#e9f4f8] text-[#2596be] rounded-lg hover:bg-[#2596be] hover:text-white transition-all"><Edit size={14} /></button><button onClick={() => setCart(cart.filter(c => c.tempId !== item.tempId))} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button></td></tr>))
              )}
            </tbody>
          </table>
        </div>
        {cart.length > 0 && (<div className="p-8 bg-slate-50 flex flex-col md:flex-row gap-4 border-t border-slate-100"><button onClick={() => setCart([])} className="flex-1 py-4 border-2 border-rose-200 text-rose-500 rounded-2xl font-black text-xs hover:bg-rose-50 transition-all uppercase">REINICIAR</button><button onClick={() => setModalType('confirmSaveOrder')} className="flex-1 py-4 bg-[#2596be] text-white rounded-2xl font-black text-xs shadow-xl shadow-[#2596be]/20 hover:bg-[#1e7a9b] transition-all uppercase flex items-center justify-center gap-2"><CheckCircle2 size={18} /> ENVIAR SOLICITUD</button></div>)}
      </div>

      {modalType === 'editCart' && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8 text-[#134b60]">
            <h3 className="font-black text-xl text-center mb-6 uppercase tracking-tighter">AJUSTAR CANTIDAD</h3>
            <input type="number" step="0.01" value={editItem?.quantity} onChange={e => setEditItem({...editItem, quantity: parseFloat(e.target.value)})} className="w-full p-6 bg-slate-50 border-2 border-slate-200 text-[#134b60] rounded-xl text-center font-black text-3xl outline-none focus:border-[#2596be]" />
            <div className="flex gap-4 pt-6"><button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase hover:bg-slate-50">CANCELAR</button><button onClick={() => { setCart(cart.map(c => c.tempId === editItem.tempId ? editItem : c)); setModalType(null); }} className="flex-1 py-4 bg-[#2596be] text-white rounded-xl font-black text-xs uppercase shadow-xl hover:bg-[#1e7a9b]">ACEPTAR</button></div>
          </div>
        </div>
      )}

      {modalType === 'confirmSaveOrder' && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-10 text-center text-[#134b60]">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h3 className="font-black text-xl mb-4 tracking-tighter leading-tight">¿CONFIRMAR ENVÍO?</h3>
            <p className="text-[10px] text-slate-400 font-black mb-8">TOTAL ESTIMADO: <span className="text-[#2596be]">{formatCurrency(cartFinancials)}</span></p>
            <div className="flex gap-4"><button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-black text-xs uppercase">VOLVER</button><button onClick={saveOrder} className="flex-1 py-4 bg-[#2596be] hover:bg-[#1e7a9b] text-white rounded-xl font-black text-xs shadow-xl uppercase">CONFIRMAR</button></div>
          </div>
        </div>
      )}

      

      <Footer />
    </div>
  );
};

// --- MÓDULO DE GESTIÓN DE PEDIDOS ---
const OrdersManagementView = ({ orders, setOrders, role, filterStatus, setFilterStatus }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [pendingChange, setPendingChange] = useState(null); 
  // --- MÓDULO DE GESTIÓN DE PEDIDOS ---

  // AQUÍ PEGAS EL CÓDIGO DEL PASO 2:
  const [discountData, setDiscountData] = useState({ global: 0, items: [] });
  const [modalType, setModalType] = useState(null); 

  // Función maestra para calcular totales con descuentos aplicados
 const getCalculatedTotals = (order) => {
    if (!order || !order.items) return { rawSubtotal: 0, totalItemDiscounts: 0, globalDiscountAmount: 0, taxesAmount: 0, total: 0 };
    
    let rawSubtotal = 0;
    let totalItemDiscounts = 0;

    order.items.forEach(item => {
      const unitPrice = item.totalPricePerUnit || item.price || 0;
      const lineTotal = unitPrice * (item.quantity || 0);
      rawSubtotal += lineTotal;
      const discountAmount = lineTotal * ((item.discount || 0) / 100);
      totalItemDiscounts += discountAmount;
    });

    const subtotalAfterItemDiscounts = rawSubtotal - totalItemDiscounts;
    const globalDiscPct = order.globalDiscount || 0;
    const globalDiscountAmount = subtotalAfterItemDiscounts * (globalDiscPct / 100);
    const subtotalAfterGlobal = subtotalAfterItemDiscounts - globalDiscountAmount;

    let taxesAmount = 0;
    order.items.forEach(item => {
      const unitPrice = item.totalPricePerUnit || item.price || 0;
      const lineTotal = unitPrice * (item.quantity || 0);
      const lineDisc = lineTotal * ((item.discount || 0) / 100);
      const lineAfterDisc = lineTotal - lineDisc;
      const proportion = subtotalAfterItemDiscounts > 0 ? lineAfterDisc / subtotalAfterItemDiscounts : 0;
      const itemSubAfterGlobal = subtotalAfterGlobal * proportion;
      const taxRate = (item.taxValue || 0) / 100;
      taxesAmount += itemSubAfterGlobal * taxRate;
    });

    const total = subtotalAfterGlobal + taxesAmount;

    return {
      rawSubtotal,
      totalItemDiscounts,
      subtotalAfterItemDiscounts,
      globalDiscountAmount,
      subtotalAfterGlobal,
      taxesAmount,
      total
    };
  };
  const executeDiscountUpdate = () => {
     // ... todo el resto del código del paso 2
  };
  // FIN DEL CÓDIGO DEL PASO 2

  // A partir de aquí sigue lo que ya tenías:
    const filteredOrders = useMemo(() => {
    if (!filterStatus || filterStatus === 'TODOS') return orders;
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const stats = useMemo(() => ({
    total: orders.length,
    new: orders.filter(o => o.status === 'NUEVA').length,
    prep: orders.filter(o => o.status === 'EN ALISTAMIENTO').length,
    shipped: orders.filter(o => o.status === 'EN CAMINO').length,
    delivered: orders.filter(o => o.status === 'ENTREGADA').length,
    cancelled: orders.filter(o => o.status === 'CANCELADA').length
  }), [orders]);

  const confirmUpdateStatus = () => {
    const { id, newStatus } = pendingChange;
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if(selectedOrder?.id === id) setSelectedOrder({...selectedOrder, status: newStatus});
    setPendingChange(null);
  };

  const getNextStatusOptions = (current) => {
    switch(current) {
        case 'NUEVA': return ['EN ALISTAMIENTO', 'CANCELADA'];
        case 'EN ALISTAMIENTO': return ['EN CAMINO', 'CANCELADA'];
        case 'EN CAMINO': return ['ENTREGADA', 'CANCELADA'];
        case 'ENTREGADA': return []; 
        default: return [];
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      'NUEVA': 'bg-[#e9f4f8] text-[#2596be] border-[#2596be]/20',
      'EN ALISTAMIENTO': 'bg-amber-50 text-amber-600 border-amber-100',
      'EN CAMINO': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'ENTREGADA': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'CANCELADA': 'bg-rose-50 text-rose-500 border-rose-100'
    };
    return <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border ${colors[status] || 'bg-slate-50 text-slate-400'}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase gap-8">
      <div className="border-b-4 border-[#2596be] w-fit pb-2">
        <h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase tracking-tighter">
            {role === 'ADMIN' ? 'GESTIÓN TOTAL DE PEDIDOS' : 'MIS PEDIDOS Y SOLICITUDES'}
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {['TODOS', 'NUEVA', 'EN ALISTAMIENTO', 'EN CAMINO', 'ENTREGADA', 'CANCELADA'].map(s => (
          <button 
            key={s} 
            onClick={() => setFilterStatus(s)}
            className={`px-6 py-2.5 rounded-xl font-black text-[9px] transition-all uppercase border-2 ${filterStatus === s ? 'bg-[#134b60] text-white border-[#134b60] shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-[#2596be]/30 hover:text-[#2596be]'}`}
          >
            {s} ({s === 'TODOS' ? stats.total : s === 'NUEVA' ? stats.new : s === 'EN ALISTAMIENTO' ? stats.prep : s === 'EN CAMINO' ? stats.shipped : s === 'ENTREGADA' ? stats.delivered : stats.cancelled})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-[#134b60] text-white text-[9px] font-black tracking-widest uppercase">
              <tr>
                <th className="px-6 py-6">ID SOLICITUD</th>
                {role === 'ADMIN' && <th className="px-6 py-6">CLIENTE</th>}
                <th className="px-6 py-6">FECHA REGISTRO</th>
                <th className="px-6 py-6 text-center">ITEMS</th>
                <th className="px-6 py-6 text-right">TOTAL</th>
                <th className="px-6 py-6 text-center">ESTADO</th>
                <th className="px-6 py-6 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-[#134b60]">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={role === 'ADMIN' ? '7' : '6'} className="px-6 py-20 text-center text-slate-300 font-black tracking-tighter">SIN REGISTROS EN ESTA CATEGORÍA</td></tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-[#e9f4f8]/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-[#2596be] font-black">{o.id}</td>
                    {role === 'ADMIN' && <td className="px-6 py-5 text-[#134b60] font-black">{o.clientName}</td>}
                    <td className="px-6 py-5 text-slate-400 font-mono text-[10px]">{o.date}</td>
                    <td className="px-6 py-5 text-center">{o.totalItems}</td>
                    <td className="px-6 py-5 text-right font-black font-mono text-emerald-600">{formatCurrency(o.totalValue)}</td>
                    <td className="px-6 py-5 text-center"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => { setSelectedOrder(o); setViewMode('list'); }} 
                        className="bg-[#e9f4f8] text-[#2596be] hover:text-white px-5 py-2.5 rounded-xl font-black text-[9px] flex items-center gap-2 ml-auto hover:bg-[#2596be] active:scale-95 transition-all"
                      >
                        <Eye size={14} /> VER DETALLE
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pendingChange && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 uppercase print:hidden">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 text-center border-t-8 border-indigo-500">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-inner">
                    <ShieldCheck size={40} />
                </div>
                <h3 className="font-black text-lg mb-2 tracking-tighter leading-tight text-[#134b60]">¿ESTÁ SEGURO?</h3>
                <p className="text-[10px] text-slate-400 font-bold mb-8">EL ESTADO PASARÁ A: <br/><span className="text-indigo-600 text-xs font-black bg-indigo-50 px-4 py-1 rounded-full inline-block mt-2 border border-indigo-100">{pendingChange.newStatus}</span></p>
                <div className="flex gap-4">
                    <button onClick={() => setPendingChange(null)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] hover:bg-slate-50 uppercase text-slate-500">VOLVER</button>
                    <button onClick={confirmUpdateStatus} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] shadow-xl uppercase hover:bg-indigo-600">CONFIRMAR</button>
                </div>
            </div>
        </div>
      )}
{modalType === 'editDiscounts' && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 uppercase print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-[#e9f4f8]/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Tag size={24}/></div>
                    <div><h3 className="font-black text-xl text-[#134b60] tracking-tighter">APLICAR DESCUENTOS</h3><p className="text-[10px] text-slate-400 font-bold">SOLICITUD: {selectedOrder?.id}</p></div>
                </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
                <div className="mb-8 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center gap-6">
                    <div className="flex-1">
                        <label className="text-[10px] font-black text-[#134b60] tracking-widest uppercase">DESCUENTO GLOBAL (%) SOBRE SUBTOTAL</label>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">Se aplica a toda la factura antes de impuestos.</p>
                    </div>
                    <input type="number" min="0" max="100" value={discountData.global} onChange={(e) => setDiscountData({...discountData, global: parseFloat(e.target.value) || 0})} className="w-32 px-4 py-3 border-2 border-amber-200 focus:border-amber-500 rounded-xl font-black text-xl text-center outline-none text-amber-700 bg-amber-50 transition-all" />
                </div>

                <p className="text-[10px] font-black text-[#134b60] tracking-widest uppercase mb-4">DESCUENTO ESPECÍFICO POR ÍTEM (%)</p>
                <div className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase"><tr><th className="px-5 py-3">PRODUCTO</th><th className="px-5 py-3 text-center">CANT.</th><th className="px-5 py-3 text-right">DESCUENTO %</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {discountData.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-[10px] font-black text-[#134b60]">{item.name}</td>
                                    <td className="px-5 py-3 text-center font-mono text-sm">{item.quantity}</td>
                                    <td className="px-5 py-3 text-right">
                                        <input type="number" min="0" max="100" value={item.discount || 0} onChange={(e) => {
                                            const newItems = [...discountData.items];
                                            newItems[idx].discount = parseFloat(e.target.value) || 0;
                                            setDiscountData({...discountData, items: newItems});
                                        }} className="w-24 px-3 py-2 border-2 border-slate-200 rounded-lg text-center font-black outline-none focus:border-[#2596be] text-[#134b60]" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-8 border-t-2 border-slate-100 bg-white flex gap-4">
                <button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-50">CANCELAR</button>
                
<button 
  onClick={() => {
    // 1. Aquí conservas tu lógica actual de guardado (si ya la tienes en otra función)
    
    // 2. Esta línea es la que cierra la ventana de descuentos y te regresa a la orden:
    // (Ajusta 'setShowDiscount' al nombre del estado que utilizas para abrir/cerrar esta vista)
    setShowDiscount(false); 
  }}
  className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-amber-600 flex justify-center items-center gap-2"
>
  <CheckCircle2 size={18}/> GUARDAR CAMBIOS FINANCIEROS
</button>

            </div>
          </div>
        </div>
      )}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase overflow-y-auto print:bg-white print:backdrop-blur-none print:p-0">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full ${viewMode === 'pdf' ? 'max-w-[816px] print:shadow-none print:rounded-none' : 'max-w-2xl animate-in zoom-in-95 duration-300'}`}>
            
            {viewMode === 'list' && (
              <div className="p-6 border-b-2 border-[#e9f4f8] flex justify-between items-center bg-white print:hidden">
                <div className="flex items-center gap-3">
                  <div className="bg-[#e9f4f8] p-2.5 rounded-xl text-[#2596be] shadow-sm border border-[#2596be]/20"><FileText size={20} /></div>
                  <div>
                    <h3 className="font-black text-sm tracking-tighter text-[#134b60]">{selectedOrder.id} - RESUMEN DE SOLICITUD</h3>
                    <p className="text-[9px] text-slate-400 font-black">{selectedOrder.date}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X size={24}/></button>
              </div>
            )}

            <div className={viewMode === 'pdf' ? "" : "p-8"}>
              {viewMode === 'list' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 col-span-2 sm:col-span-1 shadow-sm">
                      <p className="text-[8px] text-emerald-600 font-black mb-1 tracking-widest uppercase">VALOR TOTAL DE LA ORDEN</p>
                      <p className="text-2xl font-black text-emerald-800 font-mono tracking-tighter">{formatCurrency(selectedOrder.totalValue)}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center col-span-2 sm:col-span-1 shadow-sm">
                      <p className="text-[8px] text-slate-400 font-black mb-2 uppercase">ESTADO ACTUAL</p>
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>

                  {role === 'ADMIN' && (
                    <div className="p-5 bg-[#e9f4f8] border-2 border-[#2596be]/20 rounded-3xl">
                        <p className="text-[9px] font-black text-[#2596be] mb-4 text-center tracking-[0.2em] uppercase">GESTIÓN DE PROCESO LOGÍSTICO</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {getNextStatusOptions(selectedOrder.status).map(statusOption => (
                                <button 
                                    key={statusOption}
                                    onClick={() => setPendingChange({ id: selectedOrder.id, newStatus: statusOption })} 
                                    className={`w-full py-4 text-white rounded-2xl text-[10px] font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${statusOption === 'CANCELADA' ? 'bg-rose-500 hover:bg-rose-600 sm:col-span-2' : 'bg-[#2596be] hover:bg-[#1e7a9b]'}`}
                                >
                                    {statusOption === 'CANCELADA' ? <XCircle size={18}/> : <ArrowUpRight size={18}/>}
                                    MARCAR COMO: {statusOption}
                                </button>
                            ))}
                            {getNextStatusOptions(selectedOrder.status).length === 0 && (
                                <p className="text-center text-[9px] font-black text-slate-400 uppercase sm:col-span-2">SOLICITUD FINALIZADA / SIN CAMBIOS PENDIENTES</p>
                            )}
                        </div>
                    </div>
                  )}
{role === 'ADMIN' && (
                    <div className="p-5 bg-[#e9f4f8] border-2 border-[#2596be]/20 rounded-3xl mt-4">
                        <p className="text-[9px] font-black text-[#2596be] mb-4 text-center tracking-[0.2em] uppercase">GESTIÓN FINANCIERA</p>
                        <button 
                            onClick={() => { 
                                setDiscountData({ global: selectedOrder.globalDiscount || 0, items: [...selectedOrder.items] }); 
                                setModalType('editDiscounts'); 
                            }}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[10px] font-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 uppercase"
                        >
                            <Tag size={18}/> APLICAR DESCUENTOS AL PEDIDO
                        </button>
                    </div>
                  )}
                  <div className="border-2 border-slate-100 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left">
<thead className="bg-slate-50 text-[9px] font-black text-slate-400 border-b border-slate-100 uppercase">
                        <tr>
                          <th className="px-5 py-4">PRODUCTO</th>
                          <th className="px-5 py-4 text-center">CANTIDAD</th>
                          <th className="px-5 py-4 text-center">DESC.</th>
                          <th className="px-5 py-4 text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] font-bold text-[#134b60] divide-y divide-slate-50">
                        {selectedOrder.items.map((item, idx) => {
                           const baseUnit = item.totalPricePerUnit / (1 + (item.taxValue / 100));
                           const finalTotal = (baseUnit * (1 - ((item.discount || 0) / 100))) * (1 + (item.taxValue / 100)) * item.quantity;
                           return (
                          <tr key={idx}>
                            <td className="px-5 py-4">
                              <p className="text-[#134b60] font-black">{item.name}</p>
                              <p className="text-[8px] text-slate-400 uppercase">{item.unit}</p>
                              {item.observation && <p className="text-[8px] text-amber-600 font-bold mt-1 uppercase">NOTA: {item.observation}</p>}
                            </td>
                            <td className="px-5 py-4 text-center font-mono text-[#134b60] bg-slate-50/50">{item.quantity}</td>
                            <td className="px-5 py-4 text-center font-mono text-amber-500 font-black">{item.discount || 0}%</td>
                            <td className="px-5 py-4 text-right font-mono text-emerald-600 font-black">{formatCurrency(finalTotal)}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-10 md:p-14 w-full max-w-[816px] mx-auto min-h-[1056px] flex flex-col font-sans uppercase print:p-0 print:m-0 print:w-full print:max-w-full print:min-h-0 print:shadow-none text-[#134b60]">
                  <div className="flex justify-between items-start border-b-4 border-[#134b60] pb-6 mb-8">
                    <div>
                      <h2 className="text-3xl font-black text-[#134b60] tracking-tighter leading-none">DISTRIBUCIONES<br/>CASTILLA S.A.S.</h2>
                      <div className="space-y-1.5 mt-3">
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-2"><ShieldCheck size={14} className="text-[#2596be]" /> NIT: 123.456.789-0 • RÉGIMEN COMÚN</p>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-2"><MapPin size={14} className="text-[#2596be]" /> SEDE CENTRAL • COLOMBIA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[#134b60] bg-[#e9f4f8] border border-[#2596be]/30 px-4 py-1.5 rounded-full inline-block mb-3 tracking-widest">DOCUMENTO TÉCNICO</p>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">SOLICITUD Nº</p>
                      <p className="text-4xl font-black text-[#134b60] leading-none tracking-tighter">{selectedOrder.id}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                    <p className="font-black text-slate-400 mb-4 border-b border-slate-200 pb-2 text-[9px] tracking-[0.2em] uppercase">DATOS DEL CLIENTE</p>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs">
                      <div><p className="text-[9px] text-slate-400 font-bold">NOMBRE</p><p className="font-black text-[#134b60]">{selectedOrder.clientName}</p></div>
                      <div><p className="text-[9px] text-slate-400 font-bold">DOCUMENTO</p><p className="font-black text-[#134b60]">{selectedOrder.clientDocType || 'NIT'} {selectedOrder.clientDocNumber || 'N/A'}</p></div>
                      <div><p className="text-[9px] text-slate-400 font-bold">DIRECCIÓN</p><p className="font-black text-[#134b60]">{selectedOrder.clientAddress || 'NO REGISTRADA'}</p></div>
                      <div><p className="text-[9px] text-slate-400 font-bold">TELÉFONO</p><p className="font-black text-[#134b60]">{selectedOrder.clientPhone || 'NO REGISTRADO'}</p></div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#134b60] text-white text-[9px] font-black uppercase tracking-widest">
                          <th className="px-5 py-4 rounded-tl-2xl">PRODUCTO</th>
                          <th className="px-5 py-4 text-center">CANTIDAD</th>
                          <th className="px-5 py-4 text-right">VALOR UNIT.</th>
                          <th className="px-5 py-4 text-right">IVA (%)</th>
                          <th className="px-5 py-4 text-right rounded-tr-2xl">SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] font-bold text-[#134b60] divide-y divide-slate-100 border-b border-slate-200">
                        {selectedOrder.items.map((item, idx) => {
                          const baseUnit = item.totalPricePerUnit / (1 + (item.taxValue / 100));
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-5">
  <p className="text-[#134b60] font-black text-sm">{item.name}</p>
  <p className="text-slate-500 text-[10px] font-bold">{item.unit}</p>
  {item.observation && <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase">NOTA: {item.observation}</p>}
</td>
                              <td className="px-5 py-5 text-center font-mono text-[#134b60] text-sm">{item.quantity}</td>
                              <td className="px-5 py-5 text-right font-mono text-slate-500">{formatCurrency(baseUnit)}</td>
                              <td className="px-5 py-5 text-right font-mono text-[#2596be]">{item.taxValue}%</td>
                              <td className="px-5 py-5 text-right font-black text-[#134b60] text-sm">{formatCurrency(item.totalPricePerUnit * item.quantity)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mb-12">
                    <div className="w-80 space-y-3 bg-[#e9f4f8] border-2 border-[#2596be]/20 p-6 rounded-2xl">
                      {(() => {
                          const calc = getCalculatedTotals(selectedOrder);
                          return (
                              <>
                                <div className="flex justify-between font-black text-[#134b60] text-[10px] uppercase tracking-widest"><span>SUBTOTAL BASE</span><span>{formatCurrency(calc?.rawSubtotal || 0)}</span></div>
<div className="flex justify-between font-black text-amber-600 text-[10px] uppercase tracking-widest"><span>DESCUENTOS ITEMS</span><span>- {formatCurrency(calc?.totalItemDiscounts || 0)}</span></div>
<div className="flex justify-between font-black text-amber-600 text-[10px] uppercase tracking-widest"><span>DESC. GLOBAL ({selectedOrder?.globalDiscount || 0}%)</span><span>- {formatCurrency(calc?.globalDiscountAmount || 0)}</span></div>
<div className="flex justify-between font-black text-[#2596be] text-[10px] uppercase tracking-widest"><span>IMPUESTOS</span><span>{formatCurrency(calc?.taxesAmount || 0)}</span></div>
<div className="flex justify-between font-black text-[#134b60] text-xl border-t border-[#134b60]/20 pt-3 uppercase tracking-tighter"><span>TOTAL NETO</span><span>{formatCurrency(calc?.total || 0)}</span></div>
                              </>
                          )
                      })()}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t-2 border-[#134b60] flex flex-col gap-6">
                    <div className="bg-amber-50 p-4 border-l-4 border-amber-400 rounded-r-xl">
                        <p className="text-[9px] font-black text-amber-700 uppercase tracking-[0.3em] mb-1 flex items-center gap-2"><AlertTriangle size={14}/> NOTA LEGAL IMPORTANTE</p>
                        <p className="text-[9px] text-amber-900 font-bold leading-relaxed">ESTE DOCUMENTO CONSTITUYE UNA SOLICITUD DE PEDIDO INTERNA OPERATIVA. NO TIENE VALIDEZ COMO FACTURA ELECTRÓNICA DE VENTA NI COMO TÍTULO VALOR SEGÚN LA NORMATIVA VIGENTE. SUJETO A REVISIÓN DE BODEGA.</p>
                    </div>
                    <div className="flex flex-col gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Activity size={14} className="text-[#2596be]"/> WWW.DISTRIBUCIONESCASTILLA.COM</span>
                        <span className="flex items-center gap-2 text-emerald-600"><Smartphone size={14}/> WHATSAPP SOPORTE: 315000123123</span>
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.4em]">Creado con Inventrack de Distribuciones Castilla. Derechos reservados © 2026.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex gap-4 print:hidden">
              {viewMode === 'list' ? (
                <>
                  <button onClick={() => setViewMode('pdf')} className="flex-1 bg-[#134b60] text-white py-5 rounded-[24px] font-black text-[11px] flex items-center justify-center gap-3 hover:bg-[#0f3c4c] shadow-xl transition-all active:scale-95 uppercase"><FileText size={18}/> GENERAR PDF</button>
                  <button onClick={() => setSelectedOrder(null)} className="flex-1 border-2 border-slate-200 text-slate-500 py-5 rounded-[24px] font-black text-[11px] hover:bg-slate-50 transition-all uppercase">SALIR</button>
                </>
              ) : (
                <>
                  <button onClick={() => window.print()} className="flex-1 bg-[#2596be] text-white py-5 rounded-[24px] font-black text-[11px] flex items-center justify-center gap-3 hover:bg-[#1e7a9b] shadow-xl transition-all active:scale-95 uppercase"><Download size={18}/> DESCARGAR / IMPRIMIR PDF</button>
                  <button onClick={() => setViewMode('list')} className="flex-1 bg-slate-100 text-[#134b60] py-5 rounded-[24px] font-black text-[11px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all uppercase"><ChevronDown size={18} className="rotate-90"/> VOLVER AL RESUMEN</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// --- DASHBOARD DE CLIENTE ---
const ClientDashboardView = ({ orders, setActiveTab, setFilterStatus }) => {
  const stats = useMemo(() => ({
      new: orders.filter(o => o.status === 'NUEVA').length,
      prep: orders.filter(o => o.status === 'EN ALISTAMIENTO').length,
      shipped: orders.filter(o => o.status === 'EN CAMINO').length,
      delivered: orders.filter(o => o.status === 'ENTREGADA').length,
      cancelled: orders.filter(o => o.status === 'CANCELADA').length
  }), [orders]);

  const statCards = [
    { id: 'NUEVA', title: "SOLICITUDES NUEVAS", value: stats.new, icon: <FileText className="text-[#2596be]" />, color: "border-[#e9f4f8]", bg: "bg-[#e9f4f8]" },
    { id: 'EN ALISTAMIENTO', title: "EN ALISTAMIENTO", value: stats.prep, icon: <Clock className="text-amber-600" />, color: "border-amber-100", bg: "bg-amber-50" },
    { id: 'EN CAMINO', title: "PEDIDOS EN CAMINO", value: stats.shipped, icon: <Truck className="text-indigo-600" />, color: "border-indigo-100", bg: "bg-indigo-50" },
    { id: 'ENTREGADA', title: "PEDIDOS ENTREGADOS", value: stats.delivered, icon: <CheckCircle2 className="text-emerald-600" />, color: "border-emerald-100", bg: "bg-emerald-50" },
  ];

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-500 uppercase space-y-8">
      <div className="border-b-4 border-[#2596be] w-fit pb-2"><h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase tracking-tighter">PORTAL CLIENTE CASTILLA</h2></div>
      
      <RealTimeClock />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => { setFilterStatus(card.id); setActiveTab('client_orders_history'); }}
            className={`p-8 rounded-[32px] border-2 ${card.color} ${card.bg} shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 group relative overflow-hidden`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div><p className="text-[9px] text-[#134b60] opacity-70 font-black mb-1 tracking-widest">{card.title}</p><p className="text-4xl font-black text-[#134b60] tracking-tighter">{card.value}</p></div>
              <div className="bg-white/60 p-4 rounded-2xl group-hover:bg-white transition-colors shadow-sm border border-white">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#e9f4f8]/30">
          <h4 className="text-[10px] font-black text-[#134b60] tracking-widest flex items-center gap-2 uppercase"><Activity size={16} className="text-[#2596be]"/> MOVIMIENTOS RECIENTES</h4>
          <button onClick={() => setActiveTab('client_new_order')} className="bg-[#2596be] text-white px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-[#1e7a9b] shadow-lg shadow-[#2596be]/20 uppercase transition-all">CREAR SOLICITUD <ChevronRight size={14} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left uppercase">
            <thead className="bg-[#134b60] text-white text-[9px] font-black tracking-widest"><tr><th className="px-8 py-6">ID SOLICITUD</th><th className="px-8 py-6">FECHA</th><th className="px-8 py-6 text-center">ITEMS</th><th className="px-8 py-6 text-right">TOTAL ESTIMADO</th><th className="px-8 py-6 text-center">ESTADO</th><th className="px-8 py-6 text-right">ACCIÓN</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-[#134b60]">
              {orders.length === 0 ? (<tr><td colSpan="6" className="px-8 py-24 text-center text-slate-300 font-black tracking-tighter uppercase">SIN SOLICITUDES REGISTRADAS</td></tr>) : (
                orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="hover:bg-[#e9f4f8]/50 transition-colors">
                    <td className="px-8 py-6 font-mono text-[#2596be] font-black">{o.id}</td>
                    <td className="px-8 py-6 text-slate-400 font-mono text-[10px]">{o.date}</td>
                    <td className="px-8 py-6 text-center">{o.totalItems}</td>
                    <td className="px-8 py-6 text-right font-black font-mono text-emerald-600">{formatCurrency(o.totalValue)}</td>
                    <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border ${o.status === 'NUEVA' ? 'bg-[#e9f4f8] text-[#2596be] border-[#2596be]/20' : o.status === 'CANCELADA' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{o.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right"><button onClick={() => { setFilterStatus('TODOS'); setActiveTab('client_orders_history'); }} className="bg-[#e9f4f8] text-[#2596be] p-3 rounded-xl hover:bg-[#2596be] hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto text-[10px] uppercase"><Eye size={14}/> DETALLE</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// --- PANEL DE CONTROL (ADMIN) ---
const DashboardHome = ({ products, clients, inventory, orders, setActiveTab, setFilterStatus }) => {
  const stats = useMemo(() => {
    const totalInventoryValue = inventory.reduce((acc, item) => {
        const prod = products.find(p => p.id === item.productId);
        return acc + (item.quantity * (parseFloat(prod?.cost) || 0));
    }, 0);

    const ordStats = {
        new: orders.filter(o => o.status === 'NUEVA').length,
        prep: orders.filter(o => o.status === 'EN ALISTAMIENTO').length,
        shipped: orders.filter(o => o.status === 'EN CAMINO').length,
        delivered: orders.filter(o => o.status === 'ENTREGADA').length,
        cancelled: orders.filter(o => o.status === 'CANCELADA').length
    };

    return {
        products: products.length,
        clients: clients.length,
        inventoryCost: totalInventoryValue,
        orders: ordStats
    };
  }, [products, clients, inventory, orders]);

  const orderCards = [
    { id: 'NUEVA', label: 'NUEVAS', val: stats.orders.new, color: 'text-[#2596be]', bg: 'bg-[#e9f4f8]', border: 'border-[#2596be]/20', icon: <FileText size={16}/> },
    { id: 'EN ALISTAMIENTO', label: 'ALISTAMIENTO', val: stats.orders.prep, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Clock size={16}/> },
    { id: 'EN CAMINO', label: 'EN CAMINO', val: stats.orders.shipped, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: <Truck size={16}/> },
    { id: 'ENTREGADA', label: 'ENTREGADAS', val: stats.orders.delivered, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <CheckCircle2 size={16}/> },
  ];

  return (
    <div className="flex flex-col min-h-full space-y-8 animate-in fade-in duration-500 uppercase">
      <div className="border-b-4 border-[#2596be] w-fit pb-2"><h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase tracking-tighter">PANEL DE ADMINISTRACIÓN GENERAL</h2></div>
      
      <RealTimeClock />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#e9f4f8] p-8 rounded-[32px] border-2 border-[#2596be]/20 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <p className="text-[9px] text-[#2596be] font-black mb-1 uppercase tracking-widest">PRODUCTOS ACTIVOS</p>
            <p className="text-4xl font-black text-[#134b60] tracking-tighter">{stats.products}</p>
            <div className="absolute top-4 right-4 text-[#2596be] opacity-50 group-hover:rotate-12 transition-transform"><Package size={28}/></div>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[32px] border-2 border-emerald-200 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <p className="text-[9px] text-emerald-700 font-black mb-1 uppercase tracking-widest">VALOR INVENTARIO</p>
            <p className="text-2xl font-black text-emerald-900 tracking-tighter font-mono">{formatCurrency(stats.inventoryCost)}</p>
            <div className="absolute top-4 right-4 text-emerald-400 opacity-50 group-hover:scale-110 transition-transform"><DollarSign size={28}/></div>
        </div>
        <div className="bg-indigo-50 p-8 rounded-[32px] border-2 border-indigo-200 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <p className="text-[9px] text-indigo-700 font-black mb-1 uppercase tracking-widest">CLIENTES REGISTRADOS</p>
            <p className="text-4xl font-black text-indigo-900 tracking-tighter">{stats.clients}</p>
            <div className="absolute top-4 right-4 text-indigo-400 opacity-50 group-hover:scale-110 transition-transform"><Users size={28}/></div>
        </div>
        <div className="bg-rose-50 p-8 rounded-[32px] border-2 border-rose-200 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <p className="text-[9px] text-rose-700 font-black mb-1 uppercase tracking-widest">TOTAL CANCELADAS</p>
            <p className="text-4xl font-black text-rose-900 tracking-tighter">{stats.orders.cancelled}</p>
            <div className="absolute top-4 right-4 text-rose-400 opacity-50 group-hover:scale-110 transition-transform"><XCircle size={28}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orderCards.map(oc => (
            <button 
                key={oc.id}
                onClick={() => { setFilterStatus(oc.id); setActiveTab('admin_orders'); }}
                className={`bg-white p-8 rounded-[32px] border-2 ${oc.border} shadow-sm flex items-center gap-6 hover:shadow-md transition-all group active:scale-95`}
            >
                <div className={`p-4 rounded-2xl ${oc.bg} ${oc.color} group-hover:bg-white border border-transparent group-hover:${oc.border} transition-all`}>{oc.icon}</div>
                <div className="text-left">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${oc.color}`}>{oc.label}</p>
                    <p className="text-3xl font-black text-[#134b60] tracking-tighter">{oc.val}</p>
                </div>
            </button>
        ))}
      </div>

      <div className="bg-[#e9f4f8] p-10 rounded-[40px] border-2 border-[#2596be]/30 flex items-center justify-between group cursor-pointer hover:bg-[#2596be] transition-all shadow-sm active:scale-[0.99]" onClick={() => { setFilterStatus('TODOS'); setActiveTab('admin_orders'); }}>
          <div className="flex items-center gap-8">
              <div className="bg-white p-6 rounded-[28px] text-[#2596be] group-hover:text-[#134b60] group-hover:rotate-12 transition-all shadow-sm"><History size={40} /></div>
              <div>
                  <h4 className="text-2xl font-black text-[#134b60] group-hover:text-white uppercase tracking-tighter">GESTIÓN INTEGRAL DE SOLICITUDES</h4>
                  <p className="text-[10px] text-[#2596be] group-hover:text-blue-100 font-black uppercase tracking-[0.3em] mt-1">CONTROL LOGÍSTICO Y SEGUIMIENTO DE RECORRIDO</p>
              </div>
          </div>
          <ChevronRight size={48} className="text-[#2596be] group-hover:text-white transition-all group-hover:translate-x-4" />
      </div>

      <Footer />
    </div>
  );
};

// --- MÓDULO DE GESTIÓN DE ACCESOS ---
const AccessManagementView = ({ users, setUsers, clients }) => {
  const initialForm = { role: '', relatedId: '', name: '', email: '', password: '' };
  const [newUser, setNewUser] = useState(initialForm);
  const [searchClient, setSearchClient] = useState('');
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState(initialForm);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredClients = useMemo(() => searchClient ? clients.filter(c => c.docNumber.includes(searchClient) || c.name.toLowerCase().includes(searchClient.toLowerCase())).slice(0, 5) : [], [searchClient, clients]);

  const getNextID = () => `US${String(users.length + 1).padStart(6, '0')}`;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newUser.relatedId) { setErrorMsg('DEBE SELECCIONAR UN CLIENTE DEL BUSCADOR PRIMERO.'); return; }
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) { setErrorMsg('EL CORREO YA ESTÁ REGISTRADO EN EL SISTEMA.'); return; }
    setUsers([...users, { ...newUser, id: getNextID(), name: newUser.name.toUpperCase() }]);
    setNewUser(initialForm); setSearchClient(''); setErrorMsg('');
  };

  const executeUpdate = () => {
    if (users.some(u => u.id !== selectedUser.id && u.email.toLowerCase() === editData.email.toLowerCase())) { alert('ESTE CORREO ESTÁ EN USO POR OTRO USUARIO'); return; }
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editData, name: editData.name.toUpperCase() } : u));
    setModalType(null);
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-bottom-4 duration-500 uppercase gap-8">
      <div className="border-b-4 border-[#2596be] w-fit pb-2"><h2 className="text-xl md:text-2xl font-black text-[#134b60] uppercase">GESTIÓN DE ACCESOS</h2></div>
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#e9f4f8] shadow-sm w-full">
        <h3 className="font-black text-[#134b60] mb-8 flex items-center gap-2 text-[11px] uppercase"><Fingerprint size={18} className="text-[#2596be]" /> NUEVO USUARIO / CREDENCIAL</h3>
        {errorMsg && <div className="mb-4 p-4 bg-rose-50 border-2 border-rose-200 text-rose-600 font-black text-[10px] rounded-xl animate-pulse">{errorMsg}</div>}
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-6 items-end" onSubmit={handleAdd}>
          
          <div className="space-y-1 lg:col-span-2 relative">
            <label className="text-[9px] font-black text-slate-400 tracking-widest">1. BUSCAR CLIENTE (DOC / NOMBRE)</label>
            <input type="text" value={searchClient} onChange={e => {setSearchClient(e.target.value); setNewUser({...newUser, relatedId: '', name: ''});}} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase text-[#134b60]" placeholder="ESCRIBA PARA BUSCAR..." required />
            {filteredClients.length > 0 && !newUser.relatedId && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-slate-100 shadow-2xl rounded-2xl mt-1 z-[60] overflow-hidden">
                {filteredClients.map(c => <button key={c.id} type="button" onClick={() => { setNewUser({...newUser, relatedId: c.id, name: c.name, email: c.email, role: 'CLIENTE'}); setSearchClient(`${c.docNumber} - ${c.name}`); }} className="w-full text-left px-4 py-3 hover:bg-[#e9f4f8] text-[10px] font-black uppercase border-b border-slate-50 text-[#134b60]">{c.docNumber} - {c.name}</button>)}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400">2. ASIGNAR ROL</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} disabled={!newUser.relatedId} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs uppercase cursor-pointer text-[#134b60]" required>
              <option value="">SELECCIONE...</option>
              <option value="CLIENTE">CLIENTE</option>
              <option value="ADMIN">ADMINISTRADOR</option>
            </select>
          </div>
          
          <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">3. CORREO (USUARIO)</label><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} disabled={!newUser.relatedId} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs lowercase text-[#134b60]" required /></div>
          <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">4. CONTRASEÑA</label><input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} disabled={!newUser.relatedId} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#2596be] rounded-xl outline-none font-bold text-xs text-[#134b60]" required /></div>
          
          <div className="lg:col-span-5 pt-2"><button type="submit" disabled={!newUser.relatedId || !newUser.role} className="w-full bg-[#2596be] hover:bg-[#1e7a9b] text-white py-4 rounded-xl font-black text-[10px] shadow-xl transition-all active:scale-95 tracking-widest flex justify-center items-center gap-2 disabled:opacity-50"><Plus size={16} /> CREAR ACCESO AL SISTEMA</button></div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#e9f4f8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px] uppercase">
            <thead className="bg-[#134b60] text-white text-[9px] font-black tracking-widest"><tr><th className="px-6 py-6">ID USUARIO</th><th className="px-6 py-6">NOMBRE ASIGNADO</th><th className="px-6 py-6">CORREO ACCESO</th><th className="px-6 py-6 text-center">ROL</th><th className="px-6 py-6 text-right">GESTIÓN</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-[#134b60]">
              {users.length === 0 ? (<tr><td colSpan="5" className="px-6 py-20 text-center text-slate-300 font-black">SIN ACCESOS</td></tr>) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-[#e9f4f8]/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-[#2596be]">{u.id}</td>
                    <td className="px-6 py-5"><p className="font-black text-[#134b60]">{u.name}</p>{u.relatedId && <p className="text-[9px] text-slate-400">ID REL: {u.relatedId}</p>}</td>
                    <td className="px-6 py-5 font-mono lowercase text-slate-500">{u.email}</td>
                    <td className="px-6 py-5 text-center"><span className={`px-3 py-1.5 rounded-lg text-[9px] border ${u.role === 'ADMIN' ? 'bg-[#134b60] text-white border-[#134b60]' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{u.role}</span></td>
                    <td className="px-6 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => { setSelectedUser(u); setEditData(u); setModalType('edit'); }} className="p-3 bg-[#e9f4f8] text-[#2596be] rounded-xl hover:bg-[#2596be] hover:text-white transition-all shadow-sm"><Edit size={16}/></button><button onClick={() => { setSelectedUser(u); setModalType('deleteFirst'); }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" disabled={u.role === 'ADMIN' && users.filter(usr=>usr.role==='ADMIN').length===1}><Trash2 size={16}/></button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modalType === 'edit' || modalType === 'updateConfirm' || modalType === 'deleteFirst' || modalType === 'deleteSecond') && (
        <div className="fixed inset-0 bg-[#134b60]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 uppercase overflow-y-auto print:hidden">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md ${modalType === 'deleteSecond' ? 'max-w-xl border-[6px] border-rose-500' : ''}`}>
            <div className="p-8 text-[#134b60]">
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className={`p-4 rounded-full ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#e9f4f8] text-[#2596be]' : 'bg-rose-50 text-rose-500'}`}><Fingerprint size={40} /></div>
                <h3 className="font-black text-xl uppercase tracking-tighter">{modalType === 'edit' ? 'EDITAR ACCESO' : modalType === 'updateConfirm' ? 'SISTEMA: CONFIRMAR' : 'ELIMINAR ACCESO'}</h3>
              </div>
              <div className="space-y-4">
                {modalType === 'edit' && (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto px-2 py-1 scrollbar-hide">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">CORREO ACCESO</label><input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] transition-all lowercase text-[#134b60]" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">CONTRASEÑA</label><input type="text" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] transition-all text-[#134b60]" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400">ROL DEL USUARIO</label>
                      <select value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl font-black text-sm outline-none focus:border-[#2596be] transition-all text-[#134b60]">
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="ADMIN">ADMINISTRADOR</option>
                      </select>
                    </div>
                  </div>
                )}
                {modalType === 'updateConfirm' && <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl"><p className="text-indigo-700 font-black text-[10px] text-center leading-tight uppercase">⚠️ SE MODIFICARÁN LAS CREDENCIALES DE ACCESO PARA ESTE USUARIO.</p></div>}
                {modalType === 'deleteSecond' && <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl"><p className="text-rose-700 font-black text-xs text-center leading-relaxed uppercase">SE ELIMINARÁ EL ACCESO AL SISTEMA. EL USUARIO NO PODRÁ INGRESAR. ELIMINACIÓN DE {selectedUser?.name}.</p></div>}
              </div>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setModalType(null)} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition-colors">CANCELAR</button>
                <button onClick={() => {
                   if (modalType === 'edit') setModalType('updateConfirm');
                   else if (modalType === 'updateConfirm') executeUpdate();
                   else if (modalType === 'deleteFirst') setModalType('deleteSecond');
                   else if (modalType === 'deleteSecond') { setUsers(users.filter(p => p.id !== selectedUser.id)); setModalType(null); }
                }} className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${modalType === 'edit' || modalType === 'updateConfirm' ? 'bg-[#2596be] hover:bg-[#1e7a9b]' : 'bg-rose-600 hover:bg-rose-700'}`}>ACEPTAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (DASHBOARD WRAPPER) ---
const Dashboard = ({ onLogout, currentUser, users, setUsers, globalLogo, setGlobalLogo }) => {
  const role = currentUser.role; 
  const [activeTab, setActiveTab] = useState(role === 'ADMIN' ? 'dashboard' : 'client_dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('TODOS');
  
  const [taxes, setTaxes] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvFileMeta, setCsvFileMeta] = useState({ name: '', size: '' });
  const adminMenu = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={20} /> },
    { id: 'admin_orders', label: 'PEDIDOS', icon: <Activity size={20} /> },
    { id: 'access', label: 'ACCESOS', icon: <Fingerprint size={20} /> },
    { id: 'clients', label: 'CLIENTES', icon: <Users size={20} /> },
    { id: 'client_types', label: 'TIPO CLIENTE', icon: <UserCheck size={20} /> },
    { id: 'inventory', label: 'INVENTARIO', icon: <Boxes size={20} /> },
    { id: 'products', label: 'PRODUCTOS', icon: <ClipboardList size={20} /> },
    { id: 'taxes', label: 'IMPUESTOS', icon: <Percent size={20} /> },
  ];
  const clientMenu = [
    { id: 'client_dashboard', label: 'INICIO', icon: <LayoutDashboard size={20} /> },
    { id: 'client_new_order', label: 'NUEVA SOLICITUD', icon: <Plus size={20} /> },
    { id: 'client_orders_history', label: 'MIS PEDIDOS', icon: <History size={20} /> },
  ];

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGlobalLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 uppercase font-sans text-slate-900 print:bg-white">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-80 bg-[#134b60] text-[#e9f4f8] flex flex-col transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex shadow-2xl print:hidden`}>
        <div className="p-10 border-b border-[#0f3c4c] text-center uppercase tracking-widest">
          <label htmlFor="logo-upload" className={`w-16 h-16 bg-white rounded-3xl flex items-center justify-center p-1 mx-auto mb-6 shadow-xl hover:scale-105 transition-transform overflow-hidden relative group ${role === 'ADMIN' ? 'cursor-pointer' : ''}`}>
            {role === 'ADMIN' && <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleLogoUpload} />}
            <img src={globalLogo} alt="Logo DC" className={`w-full h-full object-contain transition-opacity ${role === 'ADMIN' ? 'group-hover:opacity-40' : ''}`} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <Package size={32} className="text-[#2596be] hidden" />
            {role === 'ADMIN' && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={24} className="text-[#134b60] drop-shadow-md"/></div>}
          </label>
          <span className="font-black text-xl text-white tracking-tighter">INVENTRACK</span>
          <p className="text-[9px] text-[#e9f4f8] font-black mt-2 opacity-60 uppercase tracking-[0.2em]">DISTRIBUCIONES CASTILLA S.A.S.</p>
        </div>
        <div className="px-6 py-6 flex flex-col gap-3">
           <div className={`w-full py-4 rounded-[20px] text-[10px] font-black border-2 border-[#0f3c4c] text-[#e9f4f8] flex items-center justify-center gap-3 shadow-inner bg-[#0f3c4c]/50`}><ShieldCheck size={16} className="text-[#2596be]"/> {role === 'ADMIN' ? 'ADMINISTRADOR' : 'CLIENTE'} AUTORIZADO</div>
        </div>
        <nav className="flex-1 p-8 space-y-3 overflow-y-auto scrollbar-hide">
          {role === 'ADMIN' && (
            <>
              <div className="text-[8px] text-[#e9f4f8] font-black uppercase tracking-widest pl-2 mb-2 opacity-50">MOD. ADMINISTRADOR</div>
              {adminMenu.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); if(item.id.includes('history') || item.id === 'admin_orders') setFilterStatus('TODOS'); }} className={`w-full flex items-center gap-5 p-5 rounded-[24px] transition-all font-black text-[11px] tracking-widest ${activeTab === item.id ? 'bg-[#2596be] text-white shadow-lg shadow-[#0f3c4c]/50 scale-105' : 'hover:bg-[#0f3c4c] text-[#e9f4f8] hover:text-white'}`}>{item.icon}<span>{item.label}</span></button>
              ))}
              <div className="text-[8px] text-[#e9f4f8] font-black uppercase tracking-widest pl-2 mt-8 mb-2 border-t border-[#0f3c4c] pt-6 opacity-50">MOD. CLIENTE</div>
            </>
          )}
          {clientMenu.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); if(item.id.includes('history') || item.id === 'admin_orders') setFilterStatus('TODOS'); }} className={`w-full flex items-center gap-5 p-5 rounded-[24px] transition-all font-black text-[11px] tracking-widest ${activeTab === item.id ? 'bg-[#2596be] text-white shadow-lg shadow-[#0f3c4c]/50 scale-105' : 'hover:bg-[#0f3c4c] text-[#e9f4f8] hover:text-white'}`}>{item.icon}<span>{item.label}</span></button>
          ))}
        </nav>
        <div className="p-8 border-t border-[#0f3c4c] text-center">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-4 p-5 text-[#e9f4f8] hover:text-rose-400 font-black text-[11px] transition-colors border-2 border-transparent hover:border-rose-400/20 hover:bg-rose-400/10 rounded-[24px]"><LogIn size={20} className="rotate-180" /><span>CERRAR SESIÓN</span></button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm print:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 text-[#134b60] md:hidden hover:bg-slate-100 rounded-2xl transition-all shadow-sm"><MenuIcon size={24} /></button>
          <div className="hidden sm:block relative w-96 uppercase tracking-widest"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="BÚSQUEDA OPERATIVA DEL SISTEMA..." className="w-full pl-14 pr-6 py-3 bg-slate-50 rounded-full text-[10px] outline-none font-black uppercase transition-all focus:ring-8 focus:ring-[#e9f4f8] border-2 border-transparent focus:border-[#2596be] text-[#134b60]" /></div>
          <div className="flex items-center gap-6 uppercase">
            <div className="text-right leading-tight"><p className="text-[10px] font-black text-[#134b60] uppercase tracking-tighter">{currentUser.name}</p><p className="text-[9px] text-[#2596be] font-black flex items-center justify-end gap-1.5"><span className="w-2 h-2 bg-[#2596be] rounded-full animate-pulse"></span> {role}</p></div>
            <div className="w-12 h-12 bg-[#e9f4f8] text-[#2596be] rounded-[20px] flex items-center justify-center shadow-inner border-2 border-[#2596be]/20"><UserCircle size={28} /></div>
          </div>
        </header>
        <div className="p-8 md:p-12 max-w-[1700px] mx-auto w-full flex-1 overflow-y-auto print:overflow-visible scrollbar-hide print:p-0">
          {activeTab === 'dashboard' && <DashboardHome products={products} clients={clients} inventory={inventory} orders={orders} setActiveTab={setActiveTab} setFilterStatus={setFilterStatus} />}
          {activeTab === 'admin_orders' && <OrdersManagementView orders={orders} setOrders={setOrders} role="ADMIN" filterStatus={filterStatus} setFilterStatus={setFilterStatus} />}
          {activeTab === 'inventory' && <InventoryView inventory={inventory} setInventory={setInventory} products={products} orders={orders} />}
          {activeTab === 'clients' && <ClientsView clients={clients} setClients={setClients} clientTypes={clientTypes} />}
          {activeTab === 'access' && <AccessManagementView users={users} setUsers={setUsers} clients={clients} />}
          {activeTab === 'products' && <ProductsView products={products} setProducts={setProducts} taxes={taxes} inventory={inventory} orders={orders} />}         {activeTab === 'taxes' && <ConfigurationListView title="IMPUESTOS" items={taxes} setItems={setTaxes} prefix="CI" labelName="IMPUESTO" labelValue="PORCENTAJE" /> }
          {activeTab === 'client_types' && <ConfigurationListView title="TIPO CLIENTE" items={clientTypes} setItems={setClientTypes} prefix="TC" labelName="TIPO" labelValue="RECARGO" />}
          {activeTab === 'client_dashboard' && <ClientDashboardView orders={orders} setActiveTab={setActiveTab} setFilterStatus={setFilterStatus} />}
          {activeTab === 'client_new_order' && <ClientNewOrderView products={products} orders={orders} setOrders={setOrders} currentUser={currentUser} clients={clients} clientTypes={clientTypes} inventory={inventory} />}
          {activeTab === 'client_orders_history' && <OrdersManagementView orders={orders} setOrders={setOrders} role="CLIENTE" filterStatus={filterStatus} setFilterStatus={setFilterStatus} />}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [globalLogo, setGlobalLogo] = useState("logo pestaña.jpg");
  const [users, setUsers] = useState([
        { id: 'US000001', name: 'ADMINISTRADOR PRINCIPAL', email: '1@1', password: '1', role: 'ADMIN', relatedId: null }
  ]);

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  return currentUser ? (
    <Dashboard currentUser={currentUser} onLogout={() => setCurrentUser(null)} users={users} setUsers={setUsers} globalLogo={globalLogo} setGlobalLogo={setGlobalLogo} />
  ) : (
    <Login onLogin={handleLogin} logoImage={globalLogo} />
  );
};