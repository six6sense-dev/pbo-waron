import React, { useState, useEffect } from 'react';
import { Calculator, Printer, User, Hospital, Activity, Syringe, Baby, CheckSquare, Stethoscope, Download, FileText, List, Tags } from 'lucide-react';

const CLASSES = ["KELAS III", "KELAS II", "KELAS I", "VIP", "VVIP", "PENTHOUSE", "ODC"];

// TARIFF DASAR BERDASARKAN MASTER DATA GOLONGAN
const TARIFF_RATES = {
  "GOL I": {
    op: [3500000, 4500000, 5500000, 7500000, 10000000, 15000000, 2250000],
    ok: [2200000, 2500000, 2800000, 3300000, 3900000, 4400000, 2000000],
  },
  "GOL II": {
    op: [8000000, 10000000, 13500000, 20000000, 23000000, 27000000, 5000000],
    ok: [4800000, 5400000, 5900000, 6500000, 7000000, 7600000, 3000000],
  },
  "GOL III": {
    op: [15000000, 17500000, 19000000, 24000000, 30000000, 35000000, 10000000],
    ok: [6500000, 7250000, 7750000, 8500000, 9000000, 10250000, 4000000],
  },
  "GOL KHUSUS": {
    op: [15625000, 20000000, 25000000, 29000000, 37000000, 43000000, 12000000],
    ok: [8500000, 9600000, 10700000, 11800000, 12900000, 13900000, 5000000],
  }
};

const SHARED_RATES = {
  kamar: [1300000, 1700000, 3500000, 4800000, 13000000, 18000000, 500000],
  visite: [1220000, 1260000, 1480000, 1760000, 1980000, 2200000, 500000],
  admin: [1750000, 1969000, 2397000, 3174000, 4082000, 4715000, 1000000]
};

// DATABASE TINDAKAN BERDASARKAN FILE EXCEL TERBARU
const PROCEDURES = [
  { id: "SC", category: "KANDUNGAN & KEBIDANAN", name: "SECTIO CAESAREA (SC)", gol: "GOL II", days: 2, hasBaby: true, alat: 5000000, obat: 7000000 },
  { id: "SC_GEMELI", category: "KANDUNGAN & KEBIDANAN", name: "SC GEMELI (KEMBAR)", gol: "GOL II", days: 2, hasBaby: true, jasmedMultiplier: 1.3, alat: 5000000, obat: 8000000 },
  { id: "PARTUS", category: "KANDUNGAN & KEBIDANAN", name: "PARTUS SPONTAN (NORMAL)", gol: "GOL II", days: 2, hasBaby: true, alat: 2000000, obat: 4000000 },
  { id: "KURETASE", category: "KANDUNGAN & KEBIDANAN", name: "KURETASE / DILATASI", gol: "GOL I", days: 1, hasBaby: false, alat: 2000000, obat: 3000000 },
  { id: "MOW", category: "KANDUNGAN & KEBIDANAN", name: "STERIL / MOW", gol: "GOL II", days: 1, hasBaby: false, alat: 3000000, obat: 3000000 },
  { id: "HISTEREKTOMI", category: "KANDUNGAN & KEBIDANAN", name: "HISTEREKTOMI ABDOMINAL", gol: "GOL III", days: 3, hasBaby: false, alat: 6500000, obat: 8000000 },
  { id: "MIOMEKTOMI", category: "KANDUNGAN & KEBIDANAN", name: "MIOMEKTOMI", gol: "GOL III", days: 3, hasBaby: false, alat: 6500000, obat: 8000000 },
  { id: "KISTEKTOMI", category: "KANDUNGAN & KEBIDANAN", name: "KISTEKTOMI", gol: "GOL III", days: 2, hasBaby: false, alat: 6500000, obat: 8000000 },
  { id: "HISTEROSKOPI", category: "KANDUNGAN & KEBIDANAN", name: "HISTEROSKOPI OPERATIF", gol: "GOL III", days: 1, hasBaby: false, alat: 5000000, obat: 5000000 },
  { id: "CIRCLAGE", category: "KANDUNGAN & KEBIDANAN", name: "CIRCLAGE / LIGASI CERVIX", gol: "GOL II", days: 1, hasBaby: false, alat: 5000000, obat: 4000000 },
  { id: "REPAIR", category: "KANDUNGAN & KEBIDANAN", name: "REPAIR KOLPOPERIOR", gol: "GOL I", days: 2, hasBaby: false, alat: 2500000, obat: 3000000 },
  { id: "AFF_IUD", category: "KANDUNGAN & KEBIDANAN", name: "AFF IUD (ODC)", gol: "GOL II", days: 0, hasBaby: false, alat: 1500000, obat: 2000000 },
  { id: "IUFD", category: "KANDUNGAN & KEBIDANAN", name: "IUFD OK", gol: "GOL II", days: 2, hasBaby: false, alat: 3500000, obat: 6000000 },
  
  { id: "LAP_DIAG", category: "LAPAROSKOPI", name: "LAPAROSKOPI DIAGNOSTIK", gol: "GOL II", days: 2, hasBaby: false, alat: 12920000, obat: 6000000 },
  { id: "LAP_OP", category: "LAPAROSKOPI", name: "LAPAROSKOPI (Kista/Miom/Bilateral)", gol: "GOL III", days: 2, hasBaby: false, alat: 16500000, obat: 8000000 },
  { id: "LAP_ENDOMETRIOSIS", category: "LAPAROSKOPI", name: "LAPAROSKOPI ENDOMETRIOSIS / ADENO", gol: "GOL KHUSUS", days: 3, hasBaby: false, alat: 16500000, obat: 10000000 },
  { id: "LAP_ROBOTIC", category: "LAPAROSKOPI", name: "LAPAROSKOPI ROBOTIC", gol: "GOL KHUSUS", days: 3, hasBaby: false, alat: 27500000, obat: 12000000 },
  { id: "LAP_APP", category: "LAPAROSKOPI", name: "LAPAROSKOPI APPENDICTOMY", gol: "GOL III", days: 2, hasBaby: false, alat: 12000000, obat: 7000000 },

  { id: "LAPAROTOMI", category: "BEDAH UMUM & DIGESTIF", name: "LAPAROTOMI UMUM", gol: "GOL III", days: 3, hasBaby: false, alat: 5000000, obat: 8000000 },
  { id: "LAP_DIGESTIF", category: "BEDAH UMUM & DIGESTIF", name: "LAPAROTOMI + BEDAH DIGESTIF", gol: "GOL III", days: 4, hasBaby: false, alat: 6000000, obat: 9000000 },
  { id: "SIRKUMSISI", category: "BEDAH UMUM & DIGESTIF", name: "SIRKUMSISI (SUNAT)", gol: "GOL I", days: 1, hasBaby: false, alat: 1500000, obat: 2000000 },
  { id: "HIPOSPADIA", category: "BEDAH UMUM & DIGESTIF", name: "HIPOSPADIA", gol: "GOL III", days: 3, hasBaby: false, alat: 15000000, obat: 8000000 },
  
  { id: "POLIPEKTOMI", category: "LAIN-LAIN / ODC", name: "POLIPEKTOMI (ODC)", gol: "GOL II", days: 0, hasBaby: false, alat: 2000000, obat: 3000000 },
  { id: "ODONTEKTOMI", category: "LAIN-LAIN / ODC", name: "ODONTEKTOMI", gol: "GOL II", days: 1, hasBaby: false, alat: 3000000, obat: 3000000 },
  { id: "NEVUS", category: "LAIN-LAIN / ODC", name: "NEVUS + FLAP", gol: "GOL II", days: 1, hasBaby: false, alat: 2000000, obat: 3000000 },
  { id: "WIDE_EKSISI", category: "LAIN-LAIN / ODC", name: "WIDE EKSISI", gol: "GOL KHUSUS", days: 2, hasBaby: false, alat: 4000000, obat: 5000000 },
];

const DOCTORS_OP = [
  // --- KANDUNGAN & KEBIDANAN (Sp.OG) ---
  { name: "Dr. dr. Amang Surya Priyanto., Sp.OG., F-MAS", multiplier: 1.2 }, // Wilbex
  { name: "dr. Robert Hunan Purwaka, Sp.OG, D.MAS, F.MIS", multiplier: 1.0 },
  { name: "dr. Ali Mahmud, Sp.OG, Subsp. FER", multiplier: 1.0 },
  { name: "dr. Relly Yanuari P, Sp.OG, Subsp. FER", multiplier: 1.0 },
  { name: "dr. Khoirunnisa Novitasari, Sp.OG, M.Ked.Klin", multiplier: 1.0 },
  { name: "dr. Gregorius Agung Himawan., Sp.OG., M.H., C.M.C.", multiplier: 1.0 },
  { name: "dr. Edwin Budipramana., Sp.OG., M.Kes", multiplier: 1.0 },
  { name: "dr. Hendrik Juarsa, Sp.OG", multiplier: 1.0 },
  { name: "dr. Harry K. Gondo, Sp.OG", multiplier: 1.0 },
  { name: "dr. Richard Chandra, Sp.OG, DMAS, FMIS", multiplier: 1.0 },
  { name: "dr. Amir Fahad., Sp.OG", multiplier: 1.0 },
  { name: "dr. Bahari Al-Barru., Sp.OG", multiplier: 1.0 },
  { name: "dr. Muhammad Fachry, Sp.OG", multiplier: 1.0 },
  { name: "dr. Nizar, Sp.OG", multiplier: 1.0 },
  
  // --- BEDAH UMUM & DIGESTIF (Sp.B) ---
  { name: "Dr. Adhitya Angga Wardhana, Sp.B, Subsp.BD(K)", multiplier: 1.0 },
  { name: "dr. Sidharta Himawan Giri, Sp.B, FICS", multiplier: 1.0 },
  { name: "dr. Albert Yara Limanago., Sp.B., M.Ked.Klin", multiplier: 1.0 },
  
  // --- NEUROLOGI / SARAF (Sp.N) ---
  { name: "dr. Koemalawati Widjaja., Sp.N., FMIN., COMSK", multiplier: 1.0 },
  
  // --- KEDOKTERAN FORENSIK (Sp.KF) ---
  { name: "dr. Kunthi Yulianto, Sp.KF", multiplier: 1.0 },

  // --- LAINNYA ---
  { name: "Dokter Operator Lainnya (Sesuai Golongan)", multiplier: 1.0 },
  { name: "Dokter Operator Lainnya (+20% Multiplier Khusus)", multiplier: 1.2 },
];

const DOCTORS_ASISTEN = [
  "Tanpa Asisten (Rp 0)", 
  "Belum Ditentukan (Estimasi)", 
  "dr. Asisten Operator 1", 
  "dr. Asisten Operator 2", 
  "Tim Dokter Asisten"
];

const DOCTORS_AN = [
  "Belum Ditentukan (Estimasi)", 
  "dr. Arie, Sp.An", 
  "dr. Bambang, Sp.An", 
  "Tim Dokter Anestesi"
];

const DOCTORS_AK = [
  "Tanpa Dokter Anak (Rp 0)", 
  "Belum Ditentukan (Estimasi)", 
  "dr. Mahendra Tri Arif Sampurna., Sp.A., Subsp.Neo(K)., PhD",
  "dr. Erwin Sutedjo., Sp.A",
  "dr. Agus, Sp.A", 
  "dr. Budi, Sp.A", 
  "Tim Dokter Anak"
];

const ADDONS = [
  { id: "MOW", label: "MOW (Tubektomi)", defaultPrice: 5000000 },
  { id: "MIOMA", label: "Miomektomi Tambahan", defaultPrice: 6000000 },
  { id: "KISTA", label: "Eksisi Kista Ovarium Tambahan", defaultPrice: 5000000 },
  { id: "PAIN", label: "Pain Management (PNB/PCA)", defaultPrice: 2400000 },
  { id: "NICU", label: "Observasi NICU / Perina (Est 1 Hari)", defaultPrice: 7110000 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pbo'); // 'pbo' | 'prices'
  const [procedureKey, setProcedureKey] = useState("SC");
  
  const [patient, setPatient] = useState({
    name: '',
    rm: '',
    dob: '',
    classType: 'KELAS I',
    days: PROCEDURES.find(p => p.id === "SC").days
  });

  const [medical, setMedical] = useState({
    isCyto: false,
    isHoliday: false,
    operatorIdx: 0,
    asistenIdx: 1, // Default ke Belum Ditentukan (Bukan Rp 0)
    anestesiIdx: 0,
    anakIdx: 1, // Default ke Belum Ditentukan (Bukan Rp 0)
    selectedAddons: []
  });

  const [costs, setCosts] = useState({
    operator: 0, asisten: 0, anestesi: 0, anak: 0, ok: 0, 
    kamar: 0, babyRoom: 1000000, visite: 0, 
    obat: 0, alat: 0, admin: 0, addonTotal: 0
  });

  const activeProcedure = PROCEDURES.find(p => p.id === procedureKey);
  const classIndex = CLASSES.indexOf(patient.classType);

  // Ganti Tindakan
  const handleProcedureChange = (e) => {
    const newProcId = e.target.value;
    const proc = PROCEDURES.find(p => p.id === newProcId);
    setProcedureKey(newProcId);
    
    // Auto-switch ke ODC jika tindakan tersebut standar inapnya 0 hari
    const newClassType = proc.days === 0 ? "ODC" : (patient.classType === "ODC" ? "KELAS I" : patient.classType);
    
    setPatient(prev => ({ ...prev, days: proc.days, classType: newClassType }));
  };

  // Kalkulasi Utama Real-Time
  useEffect(() => {
    const proc = activeProcedure;
    const baseRates = TARIFF_RATES[proc.gol];
    const doc = DOCTORS_OP[medical.operatorIdx];
    
    // Surcharge untuk CITO & Holiday (+30% per item jika tercentang)
    const surchargeFactor = 1.0 + (medical.isCyto ? 0.3 : 0) + (medical.isHoliday ? 0.3 : 0);
    const procJasmedMultiplier = proc.jasmedMultiplier || 1.0;
    
    // Kalkulasi Jasa
    const baseOp = baseRates.op[classIndex];
    const calcOperator = baseOp * doc.multiplier * surchargeFactor * procJasmedMultiplier;
    const calcAsisten = medical.asistenIdx === 0 ? 0 : calcOperator * 0.15; 
    const calcAnestesi = calcOperator * 0.30; 
    const calcAnak = (proc.hasBaby && medical.anakIdx !== 0) ? (calcOperator * 0.30) : 0;
    
    // Kalkulasi OK / Kamar / Alat
    const calcOK = baseRates.ok[classIndex] * surchargeFactor;
    const calcKamar = SHARED_RATES.kamar[classIndex];
    const calcVisite = SHARED_RATES.visite[classIndex];
    const calcAdmin = SHARED_RATES.admin[classIndex];
    
    // Kalkulasi Addon
    const calcAddons = medical.selectedAddons.reduce((sum, addonId) => {
      const addon = ADDONS.find(a => a.id === addonId);
      return sum + (addon ? addon.defaultPrice : 0);
    }, 0);

    setCosts({
      operator: calcOperator,
      asisten: calcAsisten,
      anestesi: calcAnestesi,
      anak: calcAnak,
      ok: calcOK,
      kamar: calcKamar,
      babyRoom: proc.hasBaby ? 1000000 : 0, 
      visite: calcVisite,
      obat: proc.obat, 
      alat: proc.alat, 
      admin: calcAdmin,
      addonTotal: calcAddons
    });
  }, [patient.classType, medical, procedureKey, patient.days]);

  const toggleAddon = (id) => {
    setMedical(prev => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(id) 
        ? prev.selectedAddons.filter(a => a !== id)
        : [...prev.selectedAddons, id]
    }));
  };

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const handleDownloadPDF = () => {
    if(activeTab !== 'pbo') {
      alert("Silakan buka tab Kalkulator PBO untuk mengunduh PDF.");
      return;
    }
    const originalTitle = document.title;
    const safeName = patient.name ? patient.name.replace(/[^a-zA-Z0-9]/g, '_') : 'PASIEN';
    document.title = `PBO_${activeProcedure.id}_${safeName}`;
    window.print();
    document.title = originalTitle;
  };

  // Grouped Categories untuk Dropdown
  const categories = [...new Set(PROCEDURES.map(p => p.category))];

  // Kalkulasi Subtotals
  const numDoctorsVisit = 1 + 1 + (activeProcedure.hasBaby && medical.anakIdx !== 0 ? 1 : 0); 
  const totalVisite = (costs.visite * patient.days) * numDoctorsVisit; 
  const totalKamar = costs.kamar * patient.days;
  const totalBaby = costs.babyRoom * patient.days;
  
  const grandTotal = costs.operator + costs.asisten + costs.anestesi + costs.anak + costs.ok + 
                     totalKamar + totalBaby + totalVisite + costs.obat + 
                     costs.alat + costs.admin + costs.addonTotal;

  return (
    <div className="min-h-screen bg-[#F7F3E9] p-4 md:p-8 font-sans text-[#4A3B32]">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none print:w-full print:max-w-full print:bg-white">
        
        {/* Header - Tema Dark Chocolate */}
        <div className="bg-[#5C4033] text-white p-6 print:bg-white print:text-black print:border-b-4 print:border-[#5C4033] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img 
              src="https://ui-avatars.com/api/?name=Waron+Hospital&background=fff&color=5C4033&rounded=true&bold=true&size=128" 
              alt="Logo Waron Hospital Surabaya" 
              className="h-12 md:h-14 w-auto object-contain bg-white rounded-lg p-1.5 shadow-sm print:shadow-none print:h-12 print:bg-transparent print:p-0"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">WARON HOSPITAL</h1>
              <p className="text-[#E2D4C8] print:text-gray-600 font-medium">Sistem Perkiraan Biaya Operasi</p>
            </div>
          </div>
          <div className="flex w-full md:w-auto items-center gap-3 print:hidden">
            <button onClick={handleDownloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#5C4033] border border-[#DCCDBE] hover:bg-[#F0E7DA] px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50">
              <Download size={20} /> Unduh PDF
            </button>
            <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#8B5E3C] hover:bg-[#A3734F] text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md">
              <Printer size={20} /> Cetak
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#F0E7DA] border-b border-[#DCCDBE] px-6 md:px-8 py-0 flex gap-1 overflow-x-auto print:hidden">
          <button 
            onClick={() => setActiveTab('pbo')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'pbo' ? 'border-[#5C4033] text-[#5C4033] bg-white' : 'border-transparent text-[#8C7A6B] hover:text-[#5C4033] hover:bg-[#EAE3D5]'}`}
          >
            <Calculator size={18} /> Kalkulator PBO
          </button>
          <button 
            onClick={() => setActiveTab('prices')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'prices' ? 'border-[#5C4033] text-[#5C4033] bg-white' : 'border-transparent text-[#8C7A6B] hover:text-[#5C4033] hover:bg-[#EAE3D5]'}`}
          >
            <List size={18} /> Daftar Harga & Referensi
          </button>
        </div>

        <div className="p-6 md:p-8">
          
          {/* =========================================
              VIEW 1: KALKULATOR PBO
             ========================================= */}
          {activeTab === 'pbo' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center pb-6 border-b-2 border-[#EAE3D5] mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-[#4A3B32]">
                  {activeProcedure.name}
                  {medical.isCyto && <span className="text-red-600 ml-2">+ CITO</span>}
                  {medical.isHoliday && <span className="text-orange-600 ml-2">+ HOLIDAY</span>}
                </h2>
                <p className="text-[#8C7A6B] font-medium mt-1">
                  Kategori: {activeProcedure.gol} | Kelas Perawatan: {patient.classType}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Kolom Kiri: Input Form (Sembunyi saat Print) */}
                <div className="lg:col-span-4 space-y-6 print:hidden">
                  
                  {/* Jenis Tindakan & Identitas */}
                  <div className="bg-[#FCFAF5] p-5 rounded-xl border border-[#EAE3D5]">
                    <h3 className="font-bold text-[#5C4A3D] flex items-center gap-2 mb-4 border-b border-[#EAE3D5] pb-2"><FileText size={18}/> Layanan & Identitas</h3>
                    <div className="space-y-4">
                      
                      {/* Pilihan Tindakan Terpadu */}
                      <div className="bg-[#F0E7DA] p-3 rounded-lg border border-[#DCCDBE]">
                        <label className="text-xs font-bold text-[#5C4033] uppercase block mb-1">Jenis Tindakan Operasi / Medis</label>
                        <select value={procedureKey} onChange={handleProcedureChange} className="w-full p-2 border border-[#C2B2A2] rounded-md text-sm font-bold text-[#3A261D] bg-white focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                          {categories.map(cat => (
                            <optgroup key={cat} label={cat}>
                              {PROCEDURES.filter(p => p.category === cat).map(proc => (
                                <option key={proc.id} value={proc.id}>{proc.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div><label className="text-xs font-bold text-[#8C7A6B] uppercase">Nama Pasien</label><input type="text" placeholder="Masukkan Nama" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} className="w-full p-2 border border-[#EAE3D5] rounded-md text-sm font-medium focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-[#8C7A6B] uppercase">No. RM</label><input type="text" placeholder="Contoh: 001196" value={patient.rm} onChange={e => setPatient({...patient, rm: e.target.value})} className="w-full p-2 border border-[#EAE3D5] rounded-md text-sm font-medium focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                        <div><label className="text-xs font-bold text-[#8C7A6B] uppercase">Tgl Lahir</label><input type="date" value={patient.dob} onChange={e => setPatient({...patient, dob: e.target.value})} className="w-full p-2 border border-[#EAE3D5] rounded-md text-sm font-medium focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-[#8C7A6B] uppercase">Kelas Inap</label>
                          <select value={patient.classType} onChange={e => setPatient({...patient, classType: e.target.value})} className="w-full p-2 border border-[#EAE3D5] rounded-md text-sm font-bold text-[#7A5233] bg-white focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><label className="text-xs font-bold text-[#8C7A6B] uppercase">Lama (Hari)</label><input type="number" value={patient.days} onChange={e => setPatient({...patient, days: Number(e.target.value)})} className="w-full p-2 border border-[#EAE3D5] rounded-md text-sm font-medium bg-white focus:ring-2 focus:ring-[#8B5E3C] outline-none" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Tim Dokter */}
                  <div className="bg-[#FCFAF5] p-5 rounded-xl border border-[#EAE3D5]">
                    <h3 className="font-bold text-[#5C4A3D] flex items-center gap-2 mb-4 border-b border-[#EAE3D5] pb-2"><Activity size={18}/> Tim Medis & Kondisi</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-between flex-1">
                          <label className="font-bold text-red-700 cursor-pointer flex-1 text-sm">Tindakan CITO</label>
                          <input type="checkbox" checked={medical.isCyto} onChange={e => setMedical({...medical, isCyto: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center justify-between flex-1">
                          <label className="font-bold text-orange-700 cursor-pointer flex-1 text-sm">Holiday Rate</label>
                          <input type="checkbox" checked={medical.isHoliday} onChange={e => setMedical({...medical, isHoliday: e.target.checked})} className="w-5 h-5 accent-orange-600 rounded" />
                        </div>
                      </div>
                      
                      {/* Dropdowns Dokter */}
                      <div>
                        <label className="text-xs font-bold text-[#8C7A6B] uppercase flex gap-1 items-center"><User size={14}/> Dokter Operator Utama</label>
                        <select value={medical.operatorIdx} onChange={e => setMedical({...medical, operatorIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-[#EAE3D5] rounded-md text-sm font-medium focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                          {DOCTORS_OP.map((d, i) => <option key={i} value={i}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#8C7A6B] uppercase flex gap-1 items-center"><Stethoscope size={14}/> Dokter Asisten</label>
                        <select value={medical.asistenIdx} onChange={e => setMedical({...medical, asistenIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-[#EAE3D5] rounded-md text-sm font-medium focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                          {DOCTORS_ASISTEN.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#8C7A6B] uppercase flex gap-1 items-center"><Syringe size={14}/> Dokter Anestesi</label>
                        <select value={medical.anestesiIdx} onChange={e => setMedical({...medical, anestesiIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-[#EAE3D5] rounded-md text-sm font-medium focus:ring-2 focus:ring-[#8B5E3C] outline-none">
                          {DOCTORS_AN.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </div>
                      
                      {activeProcedure.hasBaby && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                          <label className="text-xs font-bold text-blue-700 uppercase flex gap-1 items-center"><Baby size={14}/> Dokter Anak (Sp.A)</label>
                          <select value={medical.anakIdx} onChange={e => setMedical({...medical, anakIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-blue-200 rounded-md text-sm font-medium bg-white focus:ring-2 focus:ring-blue-400 outline-none">
                            {DOCTORS_AK.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tindakan Tambahan / Penyulit */}
                  <div className="bg-[#FCFAF5] p-5 rounded-xl border border-[#EAE3D5]">
                    <h3 className="font-bold text-[#5C4A3D] flex items-center gap-2 mb-4 border-b border-[#EAE3D5] pb-2"><CheckSquare size={18}/> Tindakan Tambahan / Penyulit</h3>
                    <div className="space-y-2">
                      {ADDONS.map(addon => (
                        <label key={addon.id} className="flex items-center gap-3 p-2 hover:bg-[#F0E7DA] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#DCCDBE]">
                          <input type="checkbox" checked={medical.selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} className="w-4 h-4 accent-[#8B5E3C] rounded"/>
                          <span className="text-sm font-medium flex-1 text-[#4A3B32]">{addon.label}</span>
                          <span className="text-xs font-bold text-[#8C7A6B]">+{formatRp(addon.defaultPrice)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Rincian PBO (Tampil Penuh saat Print) */}
                <div className="lg:col-span-8 print:col-span-12">
                  
                  {/* Info Pasien untuk Print */}
                  <div className="hidden print:grid grid-cols-2 gap-4 mb-6 border-b-2 border-black pb-4">
                    <div>
                      <table className="text-sm">
                        <tbody>
                          <tr><td className="w-32 py-1 font-semibold">Nama Pasien</td><td>: {patient.name || "______________________"}</td></tr>
                          <tr><td className="py-1 font-semibold">No. RM</td><td>: {patient.rm || "______________________"}</td></tr>
                          <tr><td className="py-1 font-semibold">Tanggal Lahir</td><td>: {patient.dob || "______________________"}</td></tr>
                          <tr><td className="py-1 font-semibold">Tindakan</td><td className="font-bold">: {activeProcedure.name}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <table className="text-sm">
                        <tbody>
                          <tr><td className="w-32 py-1 font-semibold">Kelas Perawatan</td><td>: {patient.classType}</td></tr>
                          <tr><td className="py-1 font-semibold">Lama Inap</td><td>: {patient.days} Hari</td></tr>
                          <tr><td className="py-1 font-semibold">Kondisi Khusus</td><td>: {[medical.isCyto ? 'CITO' : '', medical.isHoliday ? 'Hari Libur/Nasional' : ''].filter(Boolean).join(', ') || 'Terjadwal / Elektif'}</td></tr>
                          <tr><td className="py-1 font-semibold">DPJP Utama</td><td>: {DOCTORS_OP[medical.operatorIdx].name}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-[#EAE3D5] print:border-none overflow-hidden">
                    <div className="bg-[#F5F1E7] p-4 border-b border-[#EAE3D5] print:bg-white print:p-0 print:mb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-[#4A3B32]"><Calculator size={20} className="text-[#8B5E3C]"/> Rincian Biaya Estimasi</h3>
                    </div>
                    
                    <table className="w-full text-left text-sm print:text-[13px]">
                      <tbody className="divide-y divide-[#F0EAE1] print:divide-black">
                        {/* Jasa Medis */}
                        <tr className="bg-[#FCFAF5] print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-[#5C4033] print:text-black uppercase">1. Jasa Medis Dokter</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Jasa Dokter Operator ({activeProcedure.gol})</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.operator)}</td>
                        </tr>
                        {costs.asisten > 0 && (
                          <tr>
                            <td className="py-2.5 px-4 pl-8">Jasa Dokter Asisten {medical.asistenIdx > 1 ? `(${DOCTORS_ASISTEN[medical.asistenIdx]})` : ""}</td>
                            <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.asisten)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Jasa Dokter Anestesi {DOCTORS_AN[medical.anestesiIdx] !== "Belum Ditentukan" ? `(${DOCTORS_AN[medical.anestesiIdx]})` : ""}</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.anestesi)}</td>
                        </tr>
                        
                        {activeProcedure.hasBaby && costs.anak > 0 && (
                          <tr>
                            <td className="py-2.5 px-4 pl-8">Jasa Dokter Anak {medical.anakIdx > 1 ? `(${DOCTORS_AK[medical.anakIdx]})` : ""}</td>
                            <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.anak)}</td>
                          </tr>
                        )}
                        
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Visite Dokter ({numDoctorsVisit} Dokter) - {patient.days} Hari Perawatan</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(totalVisite)}</td>
                        </tr>

                        {/* Tindakan & Ruangan */}
                        <tr className="bg-[#FCFAF5] print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-[#5C4033] print:text-black uppercase">2. Tindakan & Kamar Perawatan</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Sewa Kamar Operasi (OK) / Ruang Tindakan</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.ok)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Sewa Alat Bedah / Instrumen Medis Khusus</td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            <input type="number" value={costs.alat} onChange={e => setCosts({...costs, alat: Number(e.target.value)})} className="w-32 text-right border-b border-[#DCCDBE] focus:outline-none focus:border-[#8B5E3C] print:border-none print:w-auto text-[#4A3B32]" />
                          </td>
                        </tr>
                        {patient.days > 0 && (
                          <tr>
                            <td className="py-2.5 px-4 pl-8">Kamar Perawatan Inap ({patient.days} Hari)</td>
                            <td className="py-2.5 px-4 text-right font-medium">{formatRp(totalKamar)}</td>
                          </tr>
                        )}
                        
                        {activeProcedure.hasBaby && patient.days > 0 && (
                          <tr>
                            <td className="py-2.5 px-4 pl-8">Kamar Bayi / Baby Room ({patient.days} Hari)</td>
                            <td className="py-2.5 px-4 text-right font-medium">{formatRp(totalBaby)}</td>
                          </tr>
                        )}

                        {/* Obat & BMHP */}
                        <tr className="bg-[#FCFAF5] print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-[#5C4033] print:text-black uppercase">3. Farmasi & Penunjang Medis</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Estimasi Obat, Lab & BMHP (Dapat disesuaikan)</td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            <input type="number" value={costs.obat} onChange={e => setCosts({...costs, obat: Number(e.target.value)})} className="w-32 text-right border-b border-[#DCCDBE] focus:outline-none focus:border-[#8B5E3C] print:border-none print:w-auto bg-[#F0E7DA] print:bg-transparent font-bold text-[#4A3B32]" />
                          </td>
                        </tr>

                        {/* Tindakan Tambahan (Jika Ada) */}
                        {medical.selectedAddons.length > 0 && (
                          <React.Fragment>
                            <tr className="bg-amber-50 print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-amber-800 print:text-black uppercase">4. Tindakan Tambahan / Penyulit</td></tr>
                            {medical.selectedAddons.map(id => {
                              const addon = ADDONS.find(a => a.id === id);
                              return (
                                <tr key={id}>
                                  <td className="py-2.5 px-4 pl-8 flex items-center gap-2"><CheckSquare size={14} className="text-amber-600 print:hidden"/> {addon.label}</td>
                                  <td className="py-2.5 px-4 text-right font-medium">{formatRp(addon.defaultPrice)}</td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        )}

                        {/* Administrasi */}
                        <tr className="bg-[#FCFAF5] print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-[#5C4033] print:text-black uppercase">5. Administrasi</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Administrasi Rumah Sakit</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.admin)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#4A3228] text-white print:bg-transparent print:text-black print:border-t-4 print:border-black print:border-b-4">
                          <td className="py-4 px-4 font-extrabold text-lg uppercase tracking-wider">Total Estimasi Biaya</td>
                          <td className="py-4 px-4 text-right font-extrabold text-xl">{formatRp(grandTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Syarat & Ketentuan / Catatan */}
                  <div className="mt-6 text-sm text-[#735F50] print:text-[11px] print:leading-tight space-y-1">
                    <p className="font-bold text-[#4A3B32] print:text-black">KETERANGAN & CATATAN PENTING:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-justify">
                      <li>Estimasi rawat inap berdasarkan standar tindakan (contoh: SC 2 malam, Laparoskopi 2 malam, ODC 0 malam). Hari tambahan akan menambah biaya kamar dan visite.</li>
                      <li>Biaya mencakup di ruang perawatan baik sebelum maupun sesudah operasi (Admin RS, Farmasi, Alat, dsb).</li>
                      {activeProcedure.hasBaby && <li>Biaya perkiraan tindakan persalinan tidak berlaku apabila bayi lahir kurang bulan (prematur) atau memerlukan observasi khusus (NICU/PICU).</li>}
                      <li>Apabila terdapat centang pada "Tindakan CITO" atau "Holiday Rate", maka berlaku tambahan tarif Darurat / Luar Jam Kerja / Hari Libur Nasional (+30%).</li>
                      <li>Apabila terdapat penyulit saat operasi, akan dikenakan biaya tambahan sesuai tindakan yang dilakukan.</li>
                      <li>Biaya ini bersifat <strong>ESTIMASI MAKSIMAL PERKIRAAN</strong>, tagihan riil / aktual akan menyesuaikan dengan rekonsiliasi pemakaian obat, alkes, dan tindakan selama pasien dirawat di rumah sakit. Harga dapat berubah sewaktu-waktu.</li>
                    </ol>
                  </div>

                  {/* Tanda Tangan Print */}
                  <div className="hidden print:flex justify-between mt-12 px-12 text-center text-sm">
                    <div>
                      <p>Surabaya, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="mb-20">Petugas Rumah Sakit</p>
                      <p className="font-bold underline text-black">( ................................................. )</p>
                    </div>
                    <div>
                      <p>&nbsp;</p>
                      <p className="mb-20">Yang Menerima Penjelasan</p>
                      <p className="font-bold underline text-black">( {patient.name || "______________________"} )</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 2: DAFTAR HARGA & REFERENSI
             ========================================= */}
          {activeTab === 'prices' && (
            <div className="animate-in fade-in duration-300 space-y-10 print:block">
              
              <div className="text-center pb-6 border-b-2 border-[#EAE3D5]">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-[#4A3B32]">Daftar Harga Master Data</h2>
                <p className="text-[#8C7A6B] font-medium mt-1">Referensi Tarif Dasar Tindakan, Jasa Dokter, dan Fasilitas</p>
              </div>

              {/* Tabel 1: Tarif Dasar Jasmed & OK per Golongan */}
              <div className="bg-white rounded-xl border border-[#EAE3D5] overflow-hidden shadow-sm">
                <div className="bg-[#5C4033] p-4 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Tarif Dasar Operasi & Jasmed (Rp)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F0E7DA] text-[#5C4033] border-b border-[#DCCDBE]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Kategori Tarif</th>
                        {CLASSES.map(c => <th key={c} className="py-3 px-4 font-bold text-right">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D5]">
                      {Object.keys(TARIFF_RATES).map((gol) => (
                        <React.Fragment key={gol}>
                          <tr className="hover:bg-[#FCFAF5] transition-colors">
                            <td className="py-3 px-4 font-semibold text-[#4A3B32] bg-[#FCFAF5]">{gol} - Jasmed Operator</td>
                            {TARIFF_RATES[gol].op.map((harga, i) => (
                              <td key={`op-${i}`} className="py-3 px-4 text-right">{formatRp(harga)}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#FCFAF5] transition-colors">
                            <td className="py-3 px-4 font-semibold text-[#8B5E3C]">{gol} - Sewa OK / Tindakan</td>
                            {TARIFF_RATES[gol].ok.map((harga, i) => (
                              <td key={`ok-${i}`} className="py-3 px-4 text-right text-[#8B5E3C]">{formatRp(harga)}</td>
                            ))}
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 2: Tarif Fasilitas Kamar dll */}
              <div className="bg-white rounded-xl border border-[#EAE3D5] overflow-hidden shadow-sm">
                <div className="bg-[#5C4033] p-4 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Hospital size={20}/> Tarif Fasilitas & Administrasi (Rp)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F0E7DA] text-[#5C4033] border-b border-[#DCCDBE]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Komponen</th>
                        {CLASSES.map(c => <th key={c} className="py-3 px-4 font-bold text-right">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D5]">
                      <tr className="hover:bg-[#FCFAF5] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#4A3B32]">Kamar Perawatan (Per Malam)</td>
                        {SHARED_RATES.kamar.map((harga, i) => <td key={i} className="py-3 px-4 text-right">{formatRp(harga)}</td>)}
                      </tr>
                      <tr className="hover:bg-[#FCFAF5] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#4A3B32]">Visite Dokter Spesialis (Per Visit)</td>
                        {SHARED_RATES.visite.map((harga, i) => <td key={i} className="py-3 px-4 text-right">{formatRp(harga)}</td>)}
                      </tr>
                      <tr className="hover:bg-[#FCFAF5] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#4A3B32]">Biaya Administrasi Rumah Sakit</td>
                        {SHARED_RATES.admin.map((harga, i) => <td key={i} className="py-3 px-4 text-right">{formatRp(harga)}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 3: Daftar Referensi Tindakan */}
              <div className="bg-white rounded-xl border border-[#EAE3D5] overflow-hidden shadow-sm">
                <div className="bg-[#5C4033] p-4 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Tags size={20}/> Daftar Referensi Tindakan & Standar Inap</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F0E7DA] text-[#5C4033] border-b border-[#DCCDBE]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Kategori</th>
                        <th className="py-3 px-4 font-bold">Nama Tindakan</th>
                        <th className="py-3 px-4 font-bold">Golongan OK</th>
                        <th className="py-3 px-4 font-bold text-center">Standar Inap</th>
                        <th className="py-3 px-4 font-bold text-right">Est. Alat Default</th>
                        <th className="py-3 px-4 font-bold text-right">Est. Obat Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D5]">
                      {PROCEDURES.map((proc, i) => (
                        <tr key={i} className="hover:bg-[#FCFAF5] transition-colors">
                          <td className="py-3 px-4 text-[#8C7A6B] text-xs font-semibold">{proc.category}</td>
                          <td className="py-3 px-4 font-bold text-[#4A3B32]">{proc.name} {proc.hasBaby && <Baby size={14} className="inline text-blue-500 ml-1"/>}</td>
                          <td className="py-3 px-4"><span className="bg-[#F0E7DA] text-[#5C4033] px-2 py-1 rounded text-xs font-bold">{proc.gol}</span></td>
                          <td className="py-3 px-4 text-center font-bold">{proc.days} Hari</td>
                          <td className="py-3 px-4 text-right text-[#8C7A6B]">{formatRp(proc.alat)}</td>
                          <td className="py-3 px-4 text-right text-[#8C7A6B]">{formatRp(proc.obat)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 4: Daftar Referensi Dokter */}
              <div className="bg-white rounded-xl border border-[#EAE3D5] overflow-hidden shadow-sm">
                <div className="bg-[#5C4033] p-4 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2"><User size={20}/> Referensi Dokter Operator & Multiplier</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCTORS_OP.map((doc, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b border-dashed border-[#EAE3D5]">
                      <span className="font-medium text-[#4A3B32] text-sm">{doc.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${doc.multiplier > 1.0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        x{doc.multiplier.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}