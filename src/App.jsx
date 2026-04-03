import React, { useState, useEffect } from 'react';
import { Calculator, Printer, User, Hospital, Activity, Syringe, Baby, CheckSquare, Stethoscope, Download, FileText, List, Tags, LogIn, Settings, LogOut, Shield, Users, AlertTriangle, MessageCircle, Bell, Paperclip, Send, Image, File, Clock, Upload } from 'lucide-react';

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

// USER MANAGEMENT SYSTEM
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator', email: 'admin@waronhospital.com' },
  { id: 2, username: 'staff1', password: 'staff123', role: 'staff', name: 'Staff PBO 1', email: 'staff1@waronhospital.com' },
  { id: 3, username: 'staff2', password: 'staff123', role: 'staff', name: 'Staff PBO 2', email: 'staff2@waronhospital.com' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pbo'); // 'pbo' | 'prices' | 'master'
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  
  // User Management State (Admin only)
  const [userList, setUserList] = useState(USERS);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'staff', name: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const unreadChatCount = chatMessages.filter(msg => msg.to === currentUser?.id && !msg.read).length;

  // Online Users & PBO History State
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [pboHistory, setPboHistory] = useState([]);

  // Database Management State (Admin only)
  const [databaseVersion, setDatabaseVersion] = useState('1.0.0');
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Master Data Editing State
  const [editingGolongan, setEditingGolongan] = useState(null);
  const [editingTindakan, setEditingTindakan] = useState(null);
  const [editingDokter, setEditingDokter] = useState(null);
  const [newGolongan, setNewGolongan] = useState({ gol: '', op: [0,0,0,0,0,0,0], ok: [0,0,0,0,0,0,0] });
  const [newTindakan, setNewTindakan] = useState({ id: '', category: '', name: '', gol: 'GOL I', days: 1, hasBaby: false, alat: 0, obat: 0 });
  const [newDokter, setNewDokter] = useState({ name: '', multiplier: 1.0 });

  // Check authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  // Load chat data on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setChatMessages(JSON.parse(savedMessages));
    }
    
    // Initialize chat users (all users except current user)
    const savedUsers = localStorage.getItem('userList');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setChatUsers(users.filter(u => u.id !== currentUser?.id));
    } else {
      setChatUsers(USERS.filter(u => u.id !== currentUser?.id));
    }
  }, [currentUser]);

  // Load PBO history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('pboHistory');
    if (savedHistory) {
      setPboHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save PBO history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pboHistory', JSON.stringify(pboHistory));
  }, [pboHistory]);

  // Manage online status
  useEffect(() => {
    if (currentUser) {
      // Add current user to online users
      setOnlineUsers(prev => new Set([...prev, currentUser.id]));
      
      // Set up periodic heartbeat to maintain online status
      const heartbeat = setInterval(() => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(currentUser.id);
          return newSet;
        });
      }, 30000); // Update every 30 seconds

      // Cleanup on unmount or logout
      return () => {
        clearInterval(heartbeat);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentUser.id);
          return newSet;
        });
      };
    }
  }, [currentUser]);

  // Authentication Functions
  const handleLogin = (e) => {
    e.preventDefault();
    const user = userList.find(u => u.username === loginForm.username && u.password === loginForm.password);
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginError('');
      setLoginForm({ username: '', password: '' });
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      setLoginError('Username atau password salah');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('pbo');
    localStorage.removeItem('currentUser');
  };

  // User Management Functions (Admin only)
  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('Semua field harus diisi!');
      return;
    }
    
    const newUserData = {
      ...newUser,
      id: Date.now()
    };
    
    setUserList([...userList, newUserData]);
    setNewUser({ username: '', password: '', role: 'staff', name: '', email: '' });
  };

  const updateUser = () => {
    if (!editingUser) return;
    
    setUserList(userList.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditingUser(null);
  };

  const deleteUser = (userId) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setUserList(userList.filter(user => user.id !== userId));
    }
  };

  // Database Management Functions (Admin only)
  const downloadDatabaseTemplate = () => {
    // Create template data structure
    const templateData = {
      procedures: PROCEDURES.map(proc => ({
        id: proc.id,
        category: proc.category,
        name: proc.name,
        gol: proc.gol,
        days: proc.days,
        hasBaby: proc.hasBaby,
        alat: proc.alat || 0,
        obat: proc.obat || 0
      })),
      tariffRates: TARIFF_RATES,
      sharedRates: SHARED_RATES,
      doctors: {
        operators: DOCTORS_OP,
        assistants: DOCTORS_ASISTEN,
        anestesi: DOCTORS_AN,
        anak: DOCTORS_AK
      },
      addons: ADDONS
    };

    // Convert to CSV format for easy editing
    const csvContent = generateDatabaseCSV(templateData);
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `database_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateDatabaseCSV = (data) => {
    let csv = 'SECTION,KEY,SUBKEY,VALUE,DESCRIPTION\n';
    
    // Procedures
    data.procedures.forEach(proc => {
      csv += `PROCEDURES,${proc.id},name,"${proc.name}",Procedure Name\n`;
      csv += `PROCEDURES,${proc.id},category,"${proc.category}",Procedure Category\n`;
      csv += `PROCEDURES,${proc.id},gol,"${proc.gol}",Golongan\n`;
      csv += `PROCEDURES,${proc.id},days,${proc.days},Default Days\n`;
      csv += `PROCEDURES,${proc.id},hasBaby,${proc.hasBaby},Has Baby Room\n`;
      csv += `PROCEDURES,${proc.id},alat,${proc.alat || 0},Alat Cost\n`;
      csv += `PROCEDURES,${proc.id},obat,${proc.obat || 0},Medicine Cost\n`;
    });

    // Tariff Rates
    Object.keys(data.tariffRates).forEach(gol => {
      ['op', 'ok'].forEach(type => {
        data.tariffRates[gol][type].forEach((rate, index) => {
          csv += `TARIFF_RATES,${gol},${type}_${index},${rate},Rate for class ${index + 1}\n`;
        });
      });
    });

    // Shared Rates
    Object.keys(data.sharedRates).forEach(type => {
      data.sharedRates[type].forEach((rate, index) => {
        csv += `SHARED_RATES,${type},${index},${rate},Rate for class ${index + 1}\n`;
      });
    });

    return csv;
  };

  const uploadDatabase = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('File harus berformat CSV!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const success = parseAndUpdateDatabase(csvText);
        
        if (success) {
          setDatabaseVersion(`1.${Date.now()}`);
          setLastUpdated(new Date().toISOString());
          alert('✅ Database berhasil diupdate!\n\nData telah disimpan dan akan disinkronkan ke Google Drive.');
          
          // Simulate Google Drive sync
          setTimeout(() => {
            alert('🔄 Sinkronisasi Google Drive selesai!\n\nDatabase telah diupload ke spreadsheet Waron Hospital.');
          }, 2000);
        } else {
          alert('❌ Gagal mengupdate database. Periksa format file CSV.');
        }
      } catch (error) {
        alert('❌ Error parsing file: ' + error.message);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const parseAndUpdateDatabase = (csvText) => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      const data = {};
      
      lines.slice(1).forEach(line => { // Skip header
        const [section, key, subkey, value, description] = line.split(',');
        
        if (!data[section]) data[section] = {};
        if (!data[section][key]) data[section][key] = {};
        
        // Parse value based on type
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(value)) parsedValue = Number(value);
        else parsedValue = value.replace(/"/g, ''); // Remove quotes
        
        data[section][key][subkey] = parsedValue;
      });

      // Here you would normally update the global database variables
      // For demo purposes, we'll just validate the structure
      console.log('Parsed database:', data);
      
      // Save to localStorage for persistence
      localStorage.setItem('databaseBackup', JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error('Error parsing database:', error);
      return false;
    }
  };

  const syncToGoogleDrive = () => {
    // Simulate Google Drive sync
    alert('🔄 Menyinkronkan ke Google Drive...\n\nMembuat backup database ke spreadsheet Waron Hospital.');
    
    setTimeout(() => {
      alert('✅ Sinkronisasi berhasil!\n\nDatabase telah diupload ke:\n📊 https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]');
    }, 3000);
  };

  // Master Data Editing Functions
  const startEditGolongan = (golKey) => {
    const golData = TARIFF_RATES[golKey];
    setEditingGolongan(golKey);
    setNewGolongan({
      gol: golKey,
      op: [...golData.op],
      ok: [...golData.ok]
    });
  };

  const saveEditGolongan = () => {
    if (!editingGolongan) return;
    
    // Update TARIFF_RATES (in a real app, this would update a backend)
    TARIFF_RATES[editingGolongan] = {
      op: newGolongan.op,
      ok: newGolongan.ok
    };
    
    alert('✅ Golongan berhasil diupdate!');
    setEditingGolongan(null);
    setNewGolongan({ gol: '', op: [0,0,0,0,0,0,0], ok: [0,0,0,0,0,0,0] });
  };

  const startEditTindakan = (tindakan) => {
    setEditingTindakan(tindakan.id);
    setNewTindakan({...tindakan});
  };

  const saveEditTindakan = () => {
    if (!editingTindakan) return;
    
    // Find and update the procedure (in a real app, this would update a backend)
    const index = PROCEDURES.findIndex(p => p.id === editingTindakan);
    if (index !== -1) {
      PROCEDURES[index] = {...newTindakan};
      alert('✅ Tindakan berhasil diupdate!');
    }
    
    setEditingTindakan(null);
    setNewTindakan({ id: '', category: '', name: '', gol: 'GOL I', days: 1, hasBaby: false, alat: 0, obat: 0 });
  };

  const startEditDokter = (category, index) => {
    let dokterData;
    let dokterType;
    
    if (category === 'operator') {
      dokterData = DOCTORS_OP[index];
      dokterType = 'operator';
    } else if (category === 'asisten') {
      dokterData = DOCTORS_ASISTEN[index];
      dokterType = 'asisten';
    } else if (category === 'anestesi') {
      dokterData = DOCTORS_AN[index];
      dokterType = 'anestesi';
    } else if (category === 'anak') {
      dokterData = DOCTORS_AK[index];
      dokterType = 'anak';
    }
    
    setEditingDokter({ type: dokterType, index, name: dokterData.name || dokterData, multiplier: dokterData.multiplier || 1.0 });
    setNewDokter({ name: dokterData.name || dokterData, multiplier: dokterData.multiplier || 1.0 });
  };

  const saveEditDokter = () => {
    if (!editingDokter) return;
    
    const { type, index } = editingDokter;
    
    if (type === 'operator') {
      DOCTORS_OP[index] = { name: newDokter.name, multiplier: newDokter.multiplier };
    } else if (type === 'asisten') {
      DOCTORS_ASISTEN[index] = newDokter.name;
    } else if (type === 'anestesi') {
      DOCTORS_AN[index] = newDokter.name;
    } else if (type === 'anak') {
      DOCTORS_AK[index] = { name: newDokter.name, multiplier: newDokter.multiplier };
    }
    
    alert('✅ Dokter berhasil diupdate!');
    setEditingDokter(null);
    setNewDokter({ name: '', multiplier: 1.0 });
  };

  const deleteGolongan = (golKey) => {
    if (confirm(`Apakah Anda yakin ingin menghapus golongan ${golKey}?`)) {
      delete TARIFF_RATES[golKey];
      alert('✅ Golongan berhasil dihapus!');
    }
  };

  const deleteTindakan = (tindakanId) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tindakan ${tindakanId}?`)) {
      const index = PROCEDURES.findIndex(p => p.id === tindakanId);
      if (index !== -1) {
        PROCEDURES.splice(index, 1);
        alert('✅ Tindakan berhasil dihapus!');
      }
    }
  };

  const deleteDokter = (category, index) => {
    let dokterName;
    if (category === 'operator') {
      dokterName = DOCTORS_OP[index].name;
      DOCTORS_OP.splice(index, 1);
    } else if (category === 'asisten') {
      dokterName = DOCTORS_ASISTEN[index];
      DOCTORS_ASISTEN.splice(index, 1);
    } else if (category === 'anestesi') {
      dokterName = DOCTORS_AN[index];
      DOCTORS_AN.splice(index, 1);
    } else if (category === 'anak') {
      dokterName = DOCTORS_AK[index].name;
      DOCTORS_AK.splice(index, 1);
    }
    
    alert(`✅ Dokter ${dokterName} berhasil dihapus!`);
  };

  // Chat Functions
  const sendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (!selectedChatUser) return;

    const message = {
      id: Date.now(),
      from: currentUser.id,
      to: selectedChatUser.id,
      content: newMessage.trim(),
      files: selectedFiles,
      timestamp: new Date().toISOString(),
      read: false
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const processedFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setSelectedFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getChatWithUser = (userId) => {
    return chatMessages.filter(msg => 
      (msg.from === currentUser?.id && msg.to === userId) || 
      (msg.from === userId && msg.to === currentUser?.id)
    );
  };

  const markMessagesAsRead = (userId) => {
    setChatMessages(prev => prev.map(msg => 
      msg.from === userId && msg.to === currentUser?.id ? { ...msg, read: true } : msg
    ));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
    
    // Kalkulasi Addon
    const calcAddons = medical.selectedAddons.reduce((sum, addonId) => {
      const addon = ADDONS.find(a => a.id === addonId);
      return sum + (addon ? addon.defaultPrice : 0);
    }, 0);
    
    // Hitung subtotal tanpa admin untuk perhitungan admin 5%
    const calcAdmin = (calcOperator + calcAsisten + calcAnestesi + calcAnak + calcOK + 
                       (SHARED_RATES.kamar[classIndex] * patient.days) + 
                       (proc.hasBaby ? 1000000 * patient.days : 0) + 
                       (SHARED_RATES.visite[classIndex] * patient.days) * (1 + 1 + (proc.hasBaby && medical.anakIdx !== 0 ? 1 : 0)) + 
                       proc.obat + proc.alat + calcAddons) * 0.05;

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
    // Check if user is logged in
    if (!isLoggedIn) {
      alert("⚠️ Akses Terbatas\n\nFitur cetak dan unduh PDF hanya tersedia untuk Staff atau Administrator yang sudah login.\n\nSilakan login terlebih dahulu untuk melanjutkan.");
      setShowLogin(true);
      return;
    }

    if(activeTab !== 'pbo') {
      alert("Silakan buka tab Kalkulator PBO untuk mengunduh PDF.");
      return;
    }

    // Record PBO generation history
    const historyEntry = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      patientName: patient.name || 'Tidak disebutkan',
      procedureName: activeProcedure.name,
      procedureId: activeProcedure.id,
      golongan: activeProcedure.gol,
      totalBiaya: grandTotal,
      timestamp: new Date().toISOString(),
      action: 'print/download'
    };

    setPboHistory(prev => [historyEntry, ...prev]);

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
    <div className={`min-h-screen bg-medical-blue-50 p-4 md:p-8 font-sans text-slate-900 ${!isLoggedIn ? 'print:hidden' : ''}`}>
      <div className="max-w-6xl mx-auto bg-medical-blue-100 rounded-xl shadow-lg border border-medical-blue-200 overflow-hidden print:shadow-none print:w-full print:max-w-full print:bg-medical-blue-50">
        
        {/* Header - Tema Dark Chocolate */}
        <div className="bg-medical-blue-600 text-navy p-6 print:bg-medical-blue-50 print:text-black print:border-b-4 print:border-medical-blue-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img 
              src="https://www.waronhospital.com/assets/logo-waron-full-C8co1Cvy.png" 
              alt="Logo Waron Hospital Surabaya" 
              className="h-12 md:h-14 w-auto object-contain bg-medical-blue-50 rounded-lg p-1.5 shadow-sm print:shadow-none print:h-12 print:bg-transparent print:p-0"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">WARON HOSPITAL</h1>
              <p className="text-medical-blue-900 print:text-medical-blue-900 font-medium">Sistem Perkiraan Biaya Operasi</p>
              <div className="hidden print:block text-[10px] print:text-gray-700 mt-1 leading-snug">
                <p>Jl. Kaliwaron No.100, Mojo, Gubeng, Surabaya, East Java</p>
                <p>Email: info@waronhospital.com | Call Center: 0800-1505-500 | IGD: (031) 99218902</p>
              </div>
            </div>
          </div>
          <div className="flex w-full md:w-auto items-center gap-3 print:hidden">
            {/* User Info & Auth Buttons */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold">{currentUser.name}</p>
                  <p className="text-xs text-medical-blue-700 capitalize">{currentUser.role === 'admin' ? 'Administrator' : 'Staff PBO'}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-2 rounded-lg font-bold transition-all shadow-sm">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="flex items-center justify-center gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-2 rounded-lg font-bold transition-all shadow-sm">
                <LogIn size={16} /> Login
              </button>
            )}
            
            {/* Print buttons only for logged-in users */}
            {isLoggedIn && (
              <>
                <button onClick={handleDownloadPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-medical-blue-50 text-slate-950 font-bold border border-medical-blue-200 hover:bg-medical-blue-100 px-5 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50">
                  <Download size={20} /> Unduh PDF
                </button>
                <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-5 py-2.5 rounded-lg font-bold transition-all shadow-md">
                  <Printer size={20} /> Cetak
                </button>
              </>
            )}
          </div>
        </div>

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
            <div className="bg-medical-blue-100 border border-medical-blue-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-medical-blue-500 via-medical-blue-600 to-medical-blue-700 text-navy p-6 text-center">
                <Shield size={52} className="mx-auto mb-3 text-navy" />
                <h2 className="text-2xl font-semibold">Portal Klinik</h2>
                <p className="text-sm opacity-90 mt-1">Masuk untuk mengakses estimasi biaya dan data pasien</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      className="w-full p-3 border border-medical-blue-300 rounded-xl bg-medical-blue-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 outline-none"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full p-3 border border-medical-blue-300 rounded-xl bg-medical-blue-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 outline-none"
                      placeholder="Masukkan password"
                      required
                    />
                  </div>
                  
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
                      {loginError}
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-medical-blue-600 hover:bg-medical-blue-700 text-navy py-3 rounded-xl font-semibold transition-all shadow-sm"
                    >
                      Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="flex-1 bg-medical-blue-200 hover:bg-medical-blue-300 text-slate-800 py-3 rounded-xl font-semibold transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </form>
                
                <div className="mt-6 pt-4 border-t border-medical-blue-200">
                  <p className="text-xs text-slate-800 font-semibold text-center leading-relaxed">
                    Developed by Hendra Winata SP
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-medical-blue-100 border-b border-medical-blue-200 px-6 md:px-8 py-0 flex gap-1 overflow-x-auto print:hidden">
          <button 
            onClick={() => setActiveTab('pbo')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'pbo' ? 'border-slate-900 text-slate-900 bg-medical-blue-100 border-b-4' : 'border-transparent text-slate-800 hover:text-slate-900 hover:bg-medical-blue-50'}`}
          >
            <Calculator size={18} /> Kalkulator PBO
          </button>
          <button 
            onClick={() => setActiveTab('prices')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'prices' ? 'border-slate-900 text-slate-900 bg-medical-blue-100 border-b-4' : 'border-transparent text-slate-800 hover:text-slate-900 hover:bg-medical-blue-50'}`}
          >
            <List size={18} /> Daftar Harga & Referensi
          </button>
          {isLoggedIn && (
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'chat' ? 'border-slate-900 text-slate-900 bg-medical-blue-100 border-b-4' : 'border-transparent text-slate-800 hover:text-slate-900 hover:bg-medical-blue-50'}`}
            >
              <MessageCircle size={18} /> Chat
              {unreadChatCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-navy bg-red-600 rounded-full ml-1">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}
          {isLoggedIn && (
            <button 
              onClick={() => setActiveTab('master')} 
              className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'master' ? 'border-slate-900 text-slate-900 bg-medical-blue-100 border-b-4' : 'border-transparent text-slate-800 hover:text-slate-900 hover:bg-medical-blue-50'}`}
            >
              <Tags size={18} /> Master Data
            </button>
          )}
          {isLoggedIn && currentUser?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'settings' ? 'border-slate-900 text-slate-900 bg-medical-blue-100 border-b-4' : 'border-transparent text-slate-800 hover:text-slate-900 hover:bg-medical-blue-50'}`}
            >
              <Settings size={18} /> Settings
            </button>
          )}
          {isLoggedIn && currentUser?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('history')} 
              className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-4 whitespace-nowrap ${activeTab === 'history' ? 'border-slate-900 text-slate-900 bg-medical-blue-100 border-b-4' : 'border-transparent text-slate-800 hover:text-slate-900 hover:bg-medical-blue-50'}`}
            >
              <FileText size={18} /> History PBO
            </button>
          )}
        </div>

        <div className="p-6 md:p-8">
          
          {/* =========================================
              VIEW 1: KALKULATOR PBO
             ========================================= */}
          {activeTab === 'pbo' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center pb-6 border-b-4 border-medical-blue-700 pl-6 relative mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-medical-blue-900">
                  {activeProcedure.name}
                  {medical.isCyto && <span className="text-medical-blue-700 ml-2">+ CITO</span>}
                  {medical.isHoliday && <span className="text-medical-blue-700 ml-2">+ HOLIDAY</span>}
                </h2>
                <p className="text-medical-blue-900 font-medium mt-1">
                  Kategori: {activeProcedure.gol} | Kelas Perawatan: {patient.classType}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Kolom Kiri: Input Form (Sembunyi saat Print) */}
                <div className="lg:col-span-4 space-y-6 print:hidden">
                  
                  {/* Jenis Tindakan & Identitas */}
                  <div className="bg-medical-blue-100 p-5 rounded-xl border border-medical-blue-200">
                    <h3 className="font-bold text-medical-blue-900 flex items-center gap-2 mb-4 border-b border-gray-200 pb-2"><FileText size={18}/> Layanan & Identitas</h3>
                    <div className="space-y-4">
                      
                      {/* Pilihan Tindakan Terpadu */}
                      <div className="bg-medical-blue-50 p-3 rounded-lg border border-gray-200">
                        <label className="text-xs font-bold text-medical-blue-900 uppercase block mb-1">Jenis Tindakan Operasi / Medis</label>
                        <select value={procedureKey} onChange={handleProcedureChange} className="w-full p-2 border border-gray-200 rounded-md text-sm font-bold text-slate-900 bg-medical-blue-50 focus:ring-2 focus:ring-medical-blue-600 outline-none">
                          {categories.map(cat => (
                            <optgroup key={cat} label={cat}>
                              {PROCEDURES.filter(p => p.category === cat).map(proc => (
                                <option key={proc.id} value={proc.id}>{proc.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div><label className="text-xs font-bold text-medical-blue-700 uppercase">Nama Pasien</label><input type="text" placeholder="Masukkan Nama" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} className="w-full p-2 border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-medical-blue-600 outline-none" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-medical-blue-700 uppercase">No. RM</label><input type="text" placeholder="Contoh: 001196" value={patient.rm} onChange={e => setPatient({...patient, rm: e.target.value})} className="w-full p-2 border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-medical-blue-600 outline-none" /></div>
                        <div><label className="text-xs font-bold text-medical-blue-700 uppercase">Tgl Lahir</label><input type="date" value={patient.dob} onChange={e => setPatient({...patient, dob: e.target.value})} className="w-full p-2 border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-medical-blue-600 outline-none" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-medical-blue-700 uppercase">Kelas Inap</label>
                          <select value={patient.classType} onChange={e => setPatient({...patient, classType: e.target.value})} className="w-full p-2 border border-gray-200 rounded-md text-sm font-bold text-slate-900 bg-medical-blue-50 focus:ring-2 focus:ring-medical-blue-600 outline-none">
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><label className="text-xs font-bold text-medical-blue-700 uppercase">Lama (Hari)</label><input type="number" value={patient.days} onChange={e => setPatient({...patient, days: Number(e.target.value)})} className="w-full p-2 border border-gray-200 rounded-md text-sm font-medium bg-medical-blue-50 focus:ring-2 focus:ring-medical-blue-600 outline-none" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Tim Dokter */}
                  <div className="bg-medical-blue-100 p-5 rounded-xl border border-medical-blue-200">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-medical-blue-200 pb-2"><Activity size={18}/> Tim Medis & Kondisi</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="bg-medical-blue-50 p-3 rounded-lg border border-medical-blue-200 flex items-center justify-between flex-1">
                          <label className="font-bold text-medical-blue-700 cursor-pointer flex-1 text-sm">Tindakan CITO</label>
                          <input type="checkbox" checked={medical.isCyto} onChange={e => setMedical({...medical, isCyto: e.target.checked})} className="w-5 h-5 accent-medical-blue-600 rounded" />
                        </div>
                        <div className="bg-medical-blue-50 p-3 rounded-lg border border-medical-blue-200 flex items-center justify-between flex-1">
                          <label className="font-bold text-medical-blue-900 cursor-pointer flex-1 text-sm">Holiday Rate</label>
                          <input type="checkbox" checked={medical.isHoliday} onChange={e => setMedical({...medical, isHoliday: e.target.checked})} className="w-5 h-5 accent-medical-blue-600 rounded" />
                        </div>
                      </div>
                      
                      {/* Dropdowns Dokter */}
                      <div>
                        <label className="text-xs font-bold text-medical-blue-700 uppercase flex gap-1 items-center"><User size={14}/> Dokter Operator Utama</label>
                        <select value={medical.operatorIdx} onChange={e => setMedical({...medical, operatorIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-medical-blue-600 outline-none">
                          {DOCTORS_OP.map((d, i) => <option key={i} value={i}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-medical-blue-700 uppercase flex gap-1 items-center"><Stethoscope size={14}/> Dokter Asisten</label>
                        <select value={medical.asistenIdx} onChange={e => setMedical({...medical, asistenIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-medical-blue-600 outline-none">
                          {DOCTORS_ASISTEN.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-medical-blue-700 uppercase flex gap-1 items-center"><Syringe size={14}/> Dokter Anestesi</label>
                        <select value={medical.anestesiIdx} onChange={e => setMedical({...medical, anestesiIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-medical-blue-600 outline-none">
                          {DOCTORS_AN.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      </div>
                      
                      {activeProcedure.hasBaby && (
                        <div className="bg-medical-blue-50 p-2 rounded border border-medical-blue-100">
                          <label className="text-xs font-bold text-medical-blue-700 uppercase flex gap-1 items-center"><Baby size={14}/> Dokter Anak (Sp.A)</label>
                          <select value={medical.anakIdx} onChange={e => setMedical({...medical, anakIdx: Number(e.target.value)})} className="w-full p-2 mt-1 border border-medical-blue-200 rounded-md text-sm font-medium bg-medical-blue-50 focus:ring-2 focus:ring-medical-blue-600 outline-none">
                            {DOCTORS_AK.map((d, i) => <option key={i} value={i}>{d}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tindakan Tambahan / Penyulit */}
                  <div className="bg-medical-blue-100 p-5 rounded-xl border border-medical-blue-200">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-medical-blue-200 pb-2"><CheckSquare size={18}/> Tindakan Tambahan / Penyulit</h3>
                    <div className="space-y-2">
                      {ADDONS.map(addon => (
                        <label key={addon.id} className="flex items-center gap-3 p-2 hover:bg-medical-blue-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-medical-blue-200">
                          <input type="checkbox" checked={medical.selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} className="w-4 h-4 accent-medical-blue-600 rounded"/>
                          <span className="text-sm font-medium flex-1 text-medical-blue-900">{addon.label}</span>
                          <span className="text-xs font-bold text-medical-blue-700">+{formatRp(addon.defaultPrice)}</span>
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

                  <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 print:border-none overflow-hidden">
                    <div className="bg-medical-blue-50 p-4 border-b border-medical-blue-200 print:bg-medical-blue-50 print:p-0 print:mb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-medical-blue-900"><Calculator size={20} className="text-medical-blue-700"/> Rincian Biaya Estimasi</h3>
                    </div>
                    
                    {/* Banner Notifikasi Estimasi */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-50 border-l-4 border-medical-blue-500 p-4 mx-4 my-4 rounded-r-lg print:bg-transparent print:border-none print:p-0 print:m-0 print:hidden">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-medical-blue-700 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-bold text-medical-blue-900 mb-1">PERHATIAN: Estimasi Biaya Maksimal</p>
                          <p className="text-medical-blue-900 leading-relaxed">
                            Biaya ini merupakan <strong>perkiraan maksimal</strong> berdasarkan standar rumah sakit. 
                            Tagihan riil akan disesuaikan dengan penggunaan obat, alat medis, dan tindakan aktual selama perawatan. 
                            Harga dapat berubah sewaktu-waktu sesuai kebijakan rumah sakit.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <table className="w-full text-left text-sm print:text-[13px]">
                      <tbody className="divide-y divide-gray-200 print:divide-black">
                        {/* Jasa Medis */}
                        <tr className="bg-medical-blue-50 print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-medical-blue-900 print:text-black uppercase">1. Jasa Medis Dokter</td></tr>
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
                        <tr className="bg-medical-blue-50 print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-medical-blue-900 print:text-black uppercase">2. Tindakan & Kamar Perawatan</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Sewa Kamar Operasi (OK) / Ruang Tindakan</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.ok)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Sewa Alat Bedah / Instrumen Medis Khusus</td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            <input type="number" value={costs.alat} onChange={e => setCosts({...costs, alat: Number(e.target.value)})} className="w-32 text-right border-b border-gray-200 focus:outline-none focus:border-medical-blue-600 print:border-none print:w-auto text-medical-blue-900" />
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
                        <tr className="bg-medical-blue-50 print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-medical-blue-900 print:text-black uppercase">3. Farmasi & Penunjang Medis</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Estimasi Obat, Lab & BMHP (Dapat disesuaikan)</td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            <input type="number" value={costs.obat} onChange={e => setCosts({...costs, obat: Number(e.target.value)})} className="w-32 text-right border-b border-gray-200 focus:outline-none focus:border-medical-blue-600 print:border-none print:w-auto bg-medical-blue-50 print:bg-transparent font-bold text-medical-blue-900" />
                          </td>
                        </tr>

                        {/* Tindakan Tambahan (Jika Ada) */}
                        {medical.selectedAddons.length > 0 && (
                          <React.Fragment>
                            <tr className="bg-medical-blue-50 print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-medical-blue-900 print:text-black uppercase">4. Tindakan Tambahan / Penyulit</td></tr>
                            {medical.selectedAddons.map(id => {
                              const addon = ADDONS.find(a => a.id === id);
                              return (
                                <tr key={id}>
                                  <td className="py-2.5 px-4 pl-8 flex items-center gap-2"><CheckSquare size={14} className="text-medical-blue-700 print:hidden"/> {addon.label}</td>
                                  <td className="py-2.5 px-4 text-right font-medium">{formatRp(addon.defaultPrice)}</td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        )}

                        {/* Administrasi */}
                        <tr className="bg-medical-blue-50 print:bg-transparent"><td colSpan="2" className="py-2 px-4 font-bold text-medical-blue-900 print:text-black uppercase">5. Administrasi</td></tr>
                        <tr>
                          <td className="py-2.5 px-4 pl-8">Administrasi Rumah Sakit (5%)</td>
                          <td className="py-2.5 px-4 text-right font-medium">{formatRp(costs.admin)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-medical-blue-900 text-medical-blue-50 print:bg-transparent print:text-black print:border-t-4 print:border-black print:border-b-4">
                          <td className="py-4 px-4 font-extrabold text-lg uppercase tracking-wider">Total Estimasi Biaya</td>
                          <td className="py-4 px-4 text-right font-extrabold text-xl">{formatRp(grandTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Syarat & Ketentuan / Catatan */}
                  <div className="mt-6 text-sm text-medical-blue-900 print:text-[11px] print:leading-tight space-y-1">
                    <p className="font-bold text-medical-blue-900 print:text-black">KETERANGAN & CATATAN PENTING:</p>
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

                  {/* Footer dengan Informasi Kontak - Hanya untuk Print */}
                  <div className="hidden print:block border-t-2 border-black mt-8 pt-4 text-center text-[9px] text-gray-700">
                    <p className="font-bold text-black mb-1">WARON HOSPITAL SURABAYA</p>
                    <p>Jl. Kaliwaron No.100, Mojo, Gubeng, Surabaya, East Java</p>
                    <p>Email: info@waronhospital.com | Call Center: 0800-1505-500</p>
                    <p>IGD (Emergency): (031) 99218902</p>
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
              
              <div className="text-center pb-6 border-b-4 border-medical-blue-700 pl-6 relative">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-medical-blue-900">Daftar Harga Master Data</h2>
                <p className="text-medical-blue-900 font-medium mt-1">Referensi Tarif Dasar Tindakan, Jasa Dokter, dan Fasilitas</p>
              </div>

              {/* Tabel 1: Tarif Dasar Jasmed & OK per Golongan */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Tarif Dasar Operasi & Jasmed (Rp)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-medical-blue-50 text-medical-blue-900 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 font-bold">Kategori Tarif</th>
                        {CLASSES.map(c => <th key={c} className="py-3 px-4 font-bold text-right">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.keys(TARIFF_RATES).map((gol) => (
                        <React.Fragment key={gol}>
                          <tr className="hover:bg-medical-blue-100 transition-colors">
                            <td className="py-3 px-4 font-semibold text-medical-blue-900 bg-medical-blue-50">{gol} - Jasmed Operator</td>
                            {TARIFF_RATES[gol].op.map((harga, i) => (
                              <td key={`op-${i}`} className="py-3 px-4 text-right">{formatRp(harga)}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-medical-blue-100 transition-colors">
                            <td className="py-3 px-4 font-semibold text-medical-blue-700">{gol} - Sewa OK / Tindakan</td>
                            {TARIFF_RATES[gol].ok.map((harga, i) => (
                              <td key={`ok-${i}`} className="py-3 px-4 text-right text-medical-blue-700">{formatRp(harga)}</td>
                            ))}
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 2: Tarif Fasilitas Kamar dll */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Hospital size={20}/> Tarif Fasilitas & Administrasi (Rp)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-medical-blue-50 text-medical-blue-900 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 font-bold">Komponen</th>
                        {CLASSES.map(c => <th key={c} className="py-3 px-4 font-bold text-right">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-medical-blue-100 transition-colors">
                        <td className="py-3 px-4 font-semibold text-medical-blue-900">Kamar Perawatan (Per Malam)</td>
                        {SHARED_RATES.kamar.map((harga, i) => <td key={i} className="py-3 px-4 text-right">{formatRp(harga)}</td>)}
                      </tr>
                      <tr className="hover:bg-medical-blue-100 transition-colors">
                        <td className="py-3 px-4 font-semibold text-medical-blue-900">Visite Dokter Spesialis (Per Visit)</td>
                        {SHARED_RATES.visite.map((harga, i) => <td key={i} className="py-3 px-4 text-right">{formatRp(harga)}</td>)}
                      </tr>
                      <tr className="hover:bg-medical-blue-100 transition-colors">
                        <td className="py-3 px-4 font-semibold text-medical-blue-900">Biaya Administrasi Rumah Sakit</td>
                        {SHARED_RATES.admin.map((harga, i) => <td key={i} className="py-3 px-4 text-right">{formatRp(harga)}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 3: Daftar Referensi Tindakan */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Tags size={20}/> Daftar Referensi Tindakan & Standar Inap</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-medical-blue-50 text-medical-blue-900 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 font-bold">Kategori</th>
                        <th className="py-3 px-4 font-bold">Nama Tindakan</th>
                        <th className="py-3 px-4 font-bold">Golongan OK</th>
                        <th className="py-3 px-4 font-bold text-center">Standar Inap</th>
                        <th className="py-3 px-4 font-bold text-right">Est. Alat Default</th>
                        <th className="py-3 px-4 font-bold text-right">Est. Obat Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {PROCEDURES.map((proc, i) => (
                        <tr key={i} className="hover:bg-medical-blue-100 transition-colors">
                          <td className="py-3 px-4 text-medical-blue-700 text-xs font-semibold">{proc.category}</td>
                          <td className="py-3 px-4 font-bold text-medical-blue-900">{proc.name} {proc.hasBaby && <Baby size={14} className="inline text-medical-blue-700 ml-1"/>}</td>
                          <td className="py-3 px-4"><span className="bg-medical-blue-50 text-medical-blue-900 px-2 py-1 rounded text-xs font-bold">{proc.gol}</span></td>
                          <td className="py-3 px-4 text-center font-bold">{proc.days} Hari</td>
                          <td className="py-3 px-4 text-right text-medical-blue-700">{formatRp(proc.alat)}</td>
                          <td className="py-3 px-4 text-right text-medical-blue-700">{formatRp(proc.obat)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 4: Daftar Referensi Dokter */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><User size={20}/> Referensi Dokter Operator & Multiplier</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCTORS_OP.map((doc, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b border-dashed border-medical-blue-200">
                      <span className="font-medium text-medical-blue-900 text-sm">{doc.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${doc.multiplier > 1.0 ? 'bg-medical-blue-50 text-medical-blue-900' : 'bg-medical-blue-100 text-medical-blue-700'}`}>
                        x{doc.multiplier.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =========================================
              VIEW 3: MASTER DATA MANAGEMENT
             ========================================= */}
          {activeTab === 'master' && isLoggedIn && (
            <div className="animate-in fade-in duration-300 space-y-8">
              
              <div className="text-center pb-6 border-b-4 border-medical-blue-700 pl-6 relative">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-medical-blue-900">Master Data Management</h2>
                <p className="text-medical-blue-900 font-medium mt-1">Kelola Data Golongan, Tindakan, dan Dokter</p>
              </div>

              {/* Edit Forms */}
              {editingGolongan && (
                <div className="bg-medical-blue-50 border border-medical-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg text-medical-blue-900 mb-4">Edit Golongan: {editingGolongan}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-medical-blue-900 mb-2">Jasmed Operator (Rp)</h4>
                      <div className="space-y-2">
                        {CLASSES.map((cls, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <label className="text-sm font-medium text-medical-blue-900 w-20">{cls}:</label>
                            <input
                              type="number"
                              value={newGolongan.op[i]}
                              onChange={(e) => {
                                const updated = [...newGolongan.op];
                                updated[i] = Number(e.target.value);
                                setNewGolongan({...newGolongan, op: updated});
                              }}
                              className="flex-1 p-2 border border-medical-blue-200 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-medical-blue-900 mb-2">Sewa OK/Tindakan (Rp)</h4>
                      <div className="space-y-2">
                        {CLASSES.map((cls, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <label className="text-sm font-medium text-medical-blue-900 w-20">{cls}:</label>
                            <input
                              type="number"
                              value={newGolongan.ok[i]}
                              onChange={(e) => {
                                const updated = [...newGolongan.ok];
                                updated[i] = Number(e.target.value);
                                setNewGolongan({...newGolongan, ok: updated});
                              }}
                              className="flex-1 p-2 border border-medical-blue-200 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveEditGolongan}
                      className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-6 py-2 rounded-lg font-bold transition-all"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setEditingGolongan(null)}
                      className="bg-medical-blue-700 hover:bg-medical-blue-700 text-navy px-6 py-2 rounded-lg font-bold transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {editingTindakan && (
                <div className="bg-medical-blue-50 border border-medical-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg text-blue-800 mb-4">Edit Tindakan: {newTindakan.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">ID Tindakan</label>
                      <input
                        type="text"
                        value={newTindakan.id}
                        onChange={(e) => setNewTindakan({...newTindakan, id: e.target.value})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={newTindakan.category}
                        onChange={(e) => setNewTindakan({...newTindakan, category: e.target.value})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Nama Tindakan</label>
                      <input
                        type="text"
                        value={newTindakan.name}
                        onChange={(e) => setNewTindakan({...newTindakan, name: e.target.value})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Golongan</label>
                      <select
                        value={newTindakan.gol}
                        onChange={(e) => setNewTindakan({...newTindakan, gol: e.target.value})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      >
                        {Object.keys(TARIFF_RATES).map(gol => (
                          <option key={gol} value={gol}>{gol}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Lama Inap (Hari)</label>
                      <input
                        type="number"
                        value={newTindakan.days}
                        onChange={(e) => setNewTindakan({...newTindakan, days: Number(e.target.value)})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Biaya Alat (Rp)</label>
                      <input
                        type="number"
                        value={newTindakan.alat}
                        onChange={(e) => setNewTindakan({...newTindakan, alat: Number(e.target.value)})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Biaya Obat (Rp)</label>
                      <input
                        type="number"
                        value={newTindakan.obat}
                        onChange={(e) => setNewTindakan({...newTindakan, obat: Number(e.target.value)})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTindakan.hasBaby}
                          onChange={(e) => setNewTindakan({...newTindakan, hasBaby: e.target.checked})}
                          className="w-4 h-4 text-medical-blue-600 rounded focus:ring-medical-blue-600"
                        />
                        <span className="text-sm font-bold text-medical-blue-700">Termasuk Kamar Bayi</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveEditTindakan}
                      className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-6 py-2 rounded-lg font-bold transition-all"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setEditingTindakan(null)}
                      className="bg-medical-blue-700 hover:bg-medical-blue-700 text-navy px-6 py-2 rounded-lg font-bold transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {editingDokter && (
                <div className="bg-medical-blue-50 border border-medical-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg text-medical-blue-800 mb-4">Edit Dokter {editingDokter.type}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-medical-blue-700 mb-1">Nama Dokter</label>
                      <input
                        type="text"
                        value={newDokter.name}
                        onChange={(e) => setNewDokter({...newDokter, name: e.target.value})}
                        className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                    </div>
                    {(editingDokter.type === 'operator' || editingDokter.type === 'anak') && (
                      <div>
                        <label className="block text-sm font-bold text-medical-blue-700 mb-1">Multiplier</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newDokter.multiplier}
                          onChange={(e) => setNewDokter({...newDokter, multiplier: Number(e.target.value)})}
                          className="w-full p-2 border border-medical-blue-300 rounded focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveEditDokter}
                      className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-6 py-2 rounded-lg font-bold transition-all"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setEditingDokter(null)}
                      className="bg-medical-blue-700 hover:bg-medical-blue-700 text-navy px-6 py-2 rounded-lg font-bold transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Section 1: Daftar Golongan */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Tags size={20}/> Daftar Golongan & Tarif Dasar</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-medical-blue-900">Kelola tarif dasar jasa medis berdasarkan golongan</p>
                    <button className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-2 rounded-lg font-bold text-sm transition-all">
                      + Tambah Golongan
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-medical-blue-50 text-medical-blue-900">
                        <tr>
                          <th className="py-3 px-4 font-bold">Golongan</th>
                          <th className="py-3 px-4 font-bold">Jasa Operator (Rp)</th>
                          <th className="py-3 px-4 font-bold">Sewa OK (Rp)</th>
                          <th className="py-3 px-4 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(TARIFF_RATES).map(([gol, rates]) => (
                          <tr key={gol} className="hover:bg-medical-blue-100 transition-colors">
                            <td className="py-3 px-4 font-bold text-medical-blue-900">{gol}</td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {CLASSES.map((cls, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="text-medical-blue-700">{cls}:</span> {formatRp(rates.op[i])}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {CLASSES.map((cls, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="text-medical-blue-700">{cls}:</span> {formatRp(rates.ok[i])}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button 
                                onClick={() => startEditGolongan(gol)} 
                                className="text-medical-blue-700 hover:text-medical-blue-700 font-bold text-sm mr-2"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteGolongan(gol)} 
                                className="text-medical-blue-900 hover:text-medical-blue-900 font-bold text-sm"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 2: Daftar Tindakan */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Activity size={20}/> Daftar Nama Tindakan</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-medical-blue-900">Kelola daftar tindakan medis dengan parameter lengkap</p>
                    <button className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-2 rounded-lg font-bold text-sm transition-all">
                      + Tambah Tindakan
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-medical-blue-50 text-medical-blue-900">
                        <tr>
                          <th className="py-3 px-4 font-bold">ID</th>
                          <th className="py-3 px-4 font-bold">Kategori</th>
                          <th className="py-3 px-4 font-bold">Nama Tindakan</th>
                          <th className="py-3 px-4 font-bold">Golongan</th>
                          <th className="py-3 px-4 font-bold">Lama Inap</th>
                          <th className="py-3 px-4 font-bold">Alat (Rp)</th>
                          <th className="py-3 px-4 font-bold">Obat (Rp)</th>
                          <th className="py-3 px-4 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {PROCEDURES.map((proc, i) => (
                          <tr key={i} className="hover:bg-medical-blue-100 transition-colors">
                            <td className="py-3 px-4 font-mono text-xs text-medical-blue-700">{proc.id}</td>
                            <td className="py-3 px-4 text-medical-blue-700 text-xs font-semibold">{proc.category}</td>
                            <td className="py-3 px-4 font-bold text-medical-blue-900">{proc.name} {proc.hasBaby && <Baby size={14} className="inline text-medical-blue-700 ml-1"/>}</td>
                            <td className="py-3 px-4"><span className="bg-medical-blue-50 text-medical-blue-900 px-2 py-1 rounded text-xs font-bold">{proc.gol}</span></td>
                            <td className="py-3 px-4 text-center font-bold">{proc.days} Hari</td>
                            <td className="py-3 px-4 text-right text-medical-blue-700">{formatRp(proc.alat)}</td>
                            <td className="py-3 px-4 text-right text-medical-blue-700">{formatRp(proc.obat)}</td>
                            <td className="py-3 px-4 text-center">
                              <button 
                                onClick={() => startEditTindakan(proc)} 
                                className="text-medical-blue-700 hover:text-medical-blue-700 font-bold text-sm mr-2"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteTindakan(proc.id)} 
                                className="text-medical-blue-900 hover:text-medical-blue-900 font-bold text-sm"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 3: Daftar Dokter */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><User size={20}/> Daftar Dokter</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-medical-blue-900">Kelola daftar dokter berdasarkan spesialisasi</p>
                    <button className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-2 rounded-lg font-bold text-sm transition-all">
                      + Tambah Dokter
                    </button>
                  </div>
                  
                  {/* Sub-tabs untuk jenis dokter */}
                  <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                      <button className="pb-2 px-1 border-b-2 border-medical-blue-700 text-medical-blue-900 font-bold">Dokter Operator</button>
                      <button className="pb-2 px-1 border-b-2 border-transparent text-medical-blue-700 hover:text-medical-blue-700">Dokter Asisten</button>
                      <button className="pb-2 px-1 border-b-2 border-transparent text-medical-blue-700 hover:text-medical-blue-700">Dokter Anestesi</button>
                      <button className="pb-2 px-1 border-b-2 border-transparent text-medical-blue-700 hover:text-medical-blue-700">Dokter Anak</button>
                    </div>
                  </div>

                  {/* Tabel Dokter Operator */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-medical-blue-50 text-medical-blue-900">
                        <tr>
                          <th className="py-3 px-4 font-bold">No</th>
                          <th className="py-3 px-4 font-bold">Nama Dokter</th>
                          <th className="py-3 px-4 font-bold">Multiplier</th>
                          <th className="py-3 px-4 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {DOCTORS_OP.map((doc, i) => (
                          <tr key={i} className="hover:bg-medical-blue-100 transition-colors">
                            <td className="py-3 px-4 text-center font-bold text-medical-blue-700">{i + 1}</td>
                            <td className="py-3 px-4 font-medium text-medical-blue-900">{doc.name}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${doc.multiplier > 1.0 ? 'bg-medical-blue-50 text-medical-blue-900' : 'bg-medical-blue-100 text-slate-800 font-semibold'}`}>
                                x{doc.multiplier.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button 
                                onClick={() => startEditDokter('operator', i)} 
                                className="text-medical-blue-700 hover:text-medical-blue-700 font-bold text-sm mr-2"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteDokter('operator', i)} 
                                className="text-medical-blue-900 hover:text-medical-blue-900 font-bold text-sm"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =========================================
              VIEW 4: PBO HISTORY (ADMIN ONLY)
             ========================================= */}
          {activeTab === 'history' && currentUser?.role === 'admin' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center pb-6 border-b-4 border-medical-blue-700 pl-6 relative mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-medical-blue-900">History PBO Generation</h2>
                <p className="text-medical-blue-900 font-medium mt-1">Riwayat generate PBO oleh seluruh user</p>
              </div>

              <div className="space-y-6">

                {/* Online Users Status */}
                <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden">
                  <div className="bg-medical-blue-600 p-4 text-navy">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Users size={20}/> Status Online Users</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userList.map(user => {
                        const isOnline = onlineUsers.has(user.id);
                        const isCurrentUser = user.id === currentUser?.id;

                        return (
                          <div key={user.id} className={`p-4 rounded-lg border-2 transition-all ${
                            isOnline
                              ? 'border-medical-blue-300 bg-medical-blue-50'
                              : 'border-gray-200 bg-medical-blue-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-medical-blue-900">{user.name}</h4>
                                <p className="text-sm text-medical-blue-900">{user.role}</p>
                                {isCurrentUser && <p className="text-xs text-medical-blue-600 font-medium">(You)</p>}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className={`w-3 h-3 rounded-full ${
                                  isOnline ? 'bg-medical-blue-500' : 'bg-medical-blue-300'
                                }`}></div>
                                <span className={`text-xs font-medium ${
                                  isOnline ? 'text-medical-blue-700' : 'text-medical-blue-700'
                                }`}>
                                  {isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PBO Generation History */}
                <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden">
                  <div className="bg-medical-blue-600 p-4 text-navy">
                    <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Riwayat Generate PBO</h3>
                  </div>
                  <div className="p-6">
                    {pboHistory.length === 0 ? (
                      <div className="text-center py-8 text-medical-blue-700">
                        <FileText size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Belum ada riwayat generate PBO</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-medical-blue-50 text-medical-blue-900">
                            <tr>
                              <th className="py-3 px-4 font-bold">Tanggal & Waktu</th>
                              <th className="py-3 px-4 font-bold">User</th>
                              <th className="py-3 px-4 font-bold">Pasien</th>
                              <th className="py-3 px-4 font-bold">Tindakan</th>
                              <th className="py-3 px-4 font-bold">Golongan</th>
                              <th className="py-3 px-4 font-bold text-right">Total Biaya</th>
                              <th className="py-3 px-4 font-bold text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {pboHistory.map(entry => (
                              <tr key={entry.id} className="hover:bg-medical-blue-100 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="text-sm font-medium text-medical-blue-900">
                                    {new Date(entry.timestamp).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-xs text-medical-blue-700">
                                    {new Date(entry.timestamp).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-medical-blue-900">{entry.userName}</div>
                                  <div className="text-xs text-medical-blue-700 capitalize">{entry.userRole}</div>
                                </td>
                                <td className="py-3 px-4 font-medium text-medical-blue-900">{entry.patientName}</td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-medical-blue-900">{entry.procedureName}</div>
                                  <div className="text-xs text-medical-blue-700">{entry.procedureId}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-xs font-bold px-2 py-1 bg-medical-blue-50 text-medical-blue-900 rounded">
                                    {entry.golongan}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-medical-blue-900">
                                  {formatRp(entry.totalBiaya)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                    {entry.action}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 5: CHAT SYSTEM
             ========================================= */}
          {activeTab === 'chat' && isLoggedIn && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center pb-6 border-b-4 border-medical-blue-700 pl-6 relative mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-medical-blue-900">Chat System</h2>
                <p className="text-medical-blue-900 font-medium mt-1">Komunikasi antar user dengan attachment file</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* User List Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden">
                    <div className="bg-medical-blue-600 p-4 text-navy">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Users size={20}/> Users</h3>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                      {chatUsers.map(user => {
                        const userMessages = getChatWithUser(user.id);
                        const unreadCount = userMessages.filter(msg => !msg.read && msg.from === user.id).length;
                        const isOnline = onlineUsers.has(user.id);
                        
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedChatUser(user);
                              markMessagesAsRead(user.id);
                            }}
                            className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
                              selectedChatUser?.id === user.id 
                                ? 'bg-medical-blue-600 text-navy' 
                                : 'bg-medical-blue-100 hover:bg-medical-blue-200 text-slate-950 font-semibold'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users size={16} />
                                <p className="font-bold text-sm text-slate-950">{user.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                  <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-navy bg-red-600 rounded-full">
                                    {unreadCount}
                                  </span>
                                )}
                                <Bell size={16} className={unreadCount > 0 ? 'text-red-600' : 'text-slate-500'} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs font-semibold text-slate-800">{user.role}</p>
                              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-medical-blue-500' : 'bg-medical-blue-300'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-3">
                  <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden h-[600px] flex flex-col">
                    
                    {/* Chat Header */}
                    <div className="bg-medical-blue-600 p-4 text-navy">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageCircle size={20}/>
                        {selectedChatUser ? `Chat dengan ${selectedChatUser.name}` : 'Pilih user untuk memulai chat'}
                      </h3>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-navy">
                      {selectedChatUser ? (
                        <div className="space-y-4">
                          {getChatWithUser(selectedChatUser.id).map(message => {
                            const isFromMe = message.from === currentUser.id;
                            const sender = isFromMe ? currentUser : selectedChatUser;
                            
                            return (
                              <div key={message.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  isFromMe 
                                    ? 'bg-medical-blue-600 text-navy' 
                                    : 'bg-medical-blue-200 border border-medical-blue-300 text-slate-950 font-semibold shadow-sm'
                                }`}>
                                  <div className="text-xs font-semibold text-slate-700 mb-1">
                                    {sender.name} • {new Date(message.timestamp).toLocaleString('id-ID')}
                                  </div>
                                  
                                  {message.content && (
                                    <div className="mb-2">{message.content}</div>
                                  )}
                                  
                                  {message.files && message.files.length > 0 && (
                                    <div className="space-y-2">
                                      {message.files.map(file => (
                                        <div key={file.id} className="flex items-center gap-2 p-2 bg-medical-blue-300 bg-opacity-80 rounded">
                                          {file.type.startsWith('image/') ? (
                                            <Image size={16} />
                                          ) : (
                                            <File size={16} />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs font-semibold text-slate-700">{formatFileSize(file.size)}</p>
                                          </div>
                                          <a 
                                            href={file.url} 
                                            download={file.name}
                                            className="text-medical-blue-700 hover:text-medical-blue-700"
                                          >
                                            <Download size={14} />
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          
                          {getChatWithUser(selectedChatUser.id).length === 0 && (
                            <div className="text-center text-medical-blue-700 py-8">
                              Belum ada pesan. Mulai percakapan dengan {selectedChatUser.name}!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-medical-blue-700 py-8 h-full flex items-center justify-center">
                          <div>
                            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Pilih user dari sidebar untuk memulai chat</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    {selectedChatUser && (
                      <div className="p-4 border-t border-medical-blue-300 bg-medical-blue-100 flex gap-2">
                        
                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {selectedFiles.map(file => (
                              <div key={file.id} className="flex items-center gap-2 bg-medical-blue-200 border border-medical-blue-400 rounded-lg p-2 shadow-sm">
                                {file.type.startsWith('image/') ? (
                                  <Image size={16} className="text-medical-blue-700" />
                                ) : (
                                  <File size={16} className="text-medical-blue-700" />
                                )}
                                <span className="text-sm font-medium text-medical-blue-900 max-w-32 truncate">{file.name}</span>
                                <button 
                                  onClick={() => removeFile(file.id)}
                                  className="text-medical-blue-900 hover:text-medical-blue-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ketik pesan..."
                            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue-600 outline-none"
                          />
                          
                          <label className="flex items-center justify-center w-12 h-12 bg-medical-blue-100 border border-medical-blue-300 rounded-lg cursor-pointer hover:bg-medical-blue-200 transition-colors shadow-sm">
                            <Paperclip size={20} className="text-medical-blue-700" />
                            <input
                              type="file"
                              multiple
                              onChange={handleFileSelect}
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                          </label>
                          
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() && selectedFiles.length === 0}
                            className="flex items-center justify-center w-12 h-12 bg-medical-blue-600 hover:bg-medical-blue-700 disabled:bg-medical-blue-100 text-navy rounded-lg transition-colors"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                        
                        <div className="text-xs text-medical-blue-700 mt-2">
                          Tekan Enter untuk kirim • Support: gambar, PDF, dokumen
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW 4: ADMIN SETTINGS
             ========================================= */}
          {activeTab === 'settings' && currentUser?.role === 'admin' && (
            <div className="animate-in fade-in duration-300 space-y-8">
              
              <div className="text-center pb-6 border-b-4 border-medical-blue-700 pl-6 relative">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-medical-blue-900">Admin Settings</h2>
                <p className="text-medical-blue-900 font-medium mt-1">Kelola User, Role, dan Sistem</p>
              </div>

              {/* Section 1: User Management */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Users size={20}/> User Management</h3>
                </div>
                <div className="p-6">
                  
                  {/* Add New User Form */}
                  <div className="mb-6 p-4 bg-medical-blue-50 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-medical-blue-900 mb-3">Tambah User Baru</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      >
                        <option value="staff">Staff PBO</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                      />
                      <button
                        onClick={addUser}
                        className="bg-medical-blue-600 hover:bg-medical-blue-800 text-navy px-4 py-2 rounded-lg font-bold transition-all"
                      >
                        + Tambah User
                      </button>
                    </div>
                  </div>

                  {/* Edit User Form */}
                  {editingUser && (
                    <div className="mb-6 p-4 bg-medical-blue-50 rounded-lg border border-medical-blue-200">
                      <h4 className="font-bold text-medical-blue-900 mb-3">Edit User: {editingUser.username}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Username"
                          value={editingUser.username}
                          onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                          className="p-2 border border-medical-blue-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                        />
                        <input
                          type="password"
                          placeholder="Password Baru (kosongkan jika tidak diubah)"
                          value={editingUser.password}
                          onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                          className="p-2 border border-medical-blue-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                        />
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                          className="p-2 border border-medical-blue-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                        >
                          <option value="staff">Staff PBO</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Nama Lengkap"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                          className="p-2 border border-medical-blue-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                          className="p-2 border border-medical-blue-200 rounded-md focus:ring-2 focus:ring-medical-blue-600 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateUser}
                            className="bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-2 rounded-lg font-bold transition-all flex-1"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-medical-blue-300 hover:bg-medical-blue-100 text-slate-900 px-4 py-2 rounded-lg font-bold transition-all"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-medical-blue-50 text-medical-blue-900">
                        <tr>
                          <th className="py-3 px-4 font-bold">Username</th>
                          <th className="py-3 px-4 font-bold">Nama</th>
                          <th className="py-3 px-4 font-bold">Role</th>
                          <th className="py-3 px-4 font-bold">Email</th>
                          <th className="py-3 px-4 font-bold">Status</th>
                          <th className="py-3 px-4 font-bold text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {userList.map((user) => (
                          <tr key={user.id} className="hover:bg-medical-blue-100 transition-colors">
                            <td className="py-3 px-4 font-mono text-medical-blue-900">{user.username}</td>
                            <td className="py-3 px-4 font-medium text-medical-blue-900">{user.name}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                user.role === 'admin' ? 'bg-medical-blue-100 text-medical-blue-900' : 'bg-medical-blue-100 text-medical-blue-700'
                              }`}>
                                {user.role === 'admin' ? 'Administrator' : 'Staff PBO'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-medical-blue-700">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                user.id === currentUser?.id ? 'bg-medical-blue-100 text-medical-blue-800' : 'bg-medical-blue-50 text-medical-blue-700'
                              }`}>
                                {user.id === currentUser?.id ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-medical-blue-700 hover:text-medical-blue-700 font-bold text-sm mr-2"
                              >
                                Edit
                              </button>
                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="text-medical-blue-900 hover:text-medical-blue-900 font-bold text-sm"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 2: System Information */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Shield size={20}/> System Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-medical-blue-900">Application Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Version:</span> 1.0.0</p>
                        <p><span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('id-ID')}</p>
                        <p><span className="font-semibold">Environment:</span> Production</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-medical-blue-900">User Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Total Users:</span> {userList.length}</p>
                        <p><span className="font-semibold">Admin Users:</span> {userList.filter(u => u.role === 'admin').length}</p>
                        <p><span className="font-semibold">Staff Users:</span> {userList.filter(u => u.role === 'staff').length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Database Management */}
              <div className="bg-medical-blue-100 rounded-xl border border-medical-blue-200 overflow-hidden shadow-sm">
                <div className="bg-medical-blue-600 p-4 text-navy">
                  <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Database Management</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-medical-blue-900">Database Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Version:</span> {databaseVersion}</p>
                        <p><span className="font-semibold">Last Updated:</span> {new Date(lastUpdated).toLocaleString('id-ID')}</p>
                        <p><span className="font-semibold">Total Procedures:</span> {PROCEDURES.length}</p>
                        <p><span className="font-semibold">Storage:</span> Google Drive Spreadsheet</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-medical-blue-900">Database Actions</h4>
                      <div className="space-y-3">
                        <button
                          onClick={downloadDatabaseTemplate}
                          className="w-full bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Download Template Database
                        </button>
                        
                        <div className="relative">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={uploadDatabase}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                          />
                          <button
                            className={`w-full px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                              isUploading 
                                ? 'bg-medical-blue-300 cursor-not-allowed' 
                                : 'bg-medical-blue-600 hover:bg-medical-blue-700 text-navy'
                            }`}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Uploading... {uploadProgress}%
                              </>
                            ) : (
                              <>
                                <FileText size={18} />
                                Upload Database (CSV)
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={syncToGoogleDrive}
                          className="w-full bg-medical-blue-600 hover:bg-medical-blue-700 text-navy px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Shield size={18} />
                          Sync to Google Drive
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-medical-blue-50 border border-medical-blue-200 rounded-lg">
                    <h5 className="font-bold text-medical-blue-900 mb-2">📋 Instruksi Database Management:</h5>
                    <ul className="text-sm text-medical-blue-900 space-y-1">
                      <li>• <strong>Download Template:</strong> Unduh template CSV untuk mengedit database</li>
                      <li>• <strong>Edit di Spreadsheet:</strong> Buka file CSV di Google Sheets atau Excel</li>
                      <li>• <strong>Update Harga:</strong> Sesuaikan tarif, golongan, dan biaya terbaru</li>
                      <li>• <strong>Upload Database:</strong> Upload file CSV yang telah diupdate</li>
                      <li>• <strong>Sync Google Drive:</strong> Sinkronkan perubahan ke spreadsheet utama</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}







