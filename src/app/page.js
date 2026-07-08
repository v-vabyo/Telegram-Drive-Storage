"use client";

import { useState, useEffect, useRef } from 'react';
import { Upload, File as FileIcon, Download, Lock, Loader2, FolderPlus, Folder, ChevronRight, Home as HomeIcon, Trash2, Search, LayoutGrid, List as ListIcon, Plus, X, Cloud, Edit2, LogOut, Info, User, ChevronDown, Moon, Sun, Image as ImageIcon, FileText, Film, Music, Archive, MoreVertical, Copy, Clock, Star, RotateCcw } from 'lucide-react';
import { countryCodes } from '../lib/countries';

const dict = {
  id: {
    loginTitle: "Masuk Telegram",
    phoneNumber: "Nomor Handphone",
    sendOTP: "Kirim Kode OTP",
    verifyCode: "Kode Verifikasi",
    verifySubtitle: "Cek aplikasi Telegram Anda untuk melihat kode dari sistem.",
    verifyBtn: "Verifikasi & Login",
    passwordTitle: "Kata Sandi (2-Step Verification)",
    passwordPlaceholder: "Masukkan kata sandi...",
    finishLogin: "Selesaikan Login",
    e2ee: "End-to-End Encrypted (E2EE)",
    agree1: "Dengan masuk, Anda menyetujui ",
    agree2: "Persyaratan Layanan",
    agree3: " dan ",
    agree4: "Kebijakan Privasi",
    agree5: " kami.",
    searchPlaceholder: "Cari kode atau negara...",
    notFound: "Negara tidak ditemukan",
    termsTitle: "Persyaratan Layanan",
    termsContent: [
      "Selamat datang di Telegram Drive Storage. Dengan menggunakan layanan ini, Anda setuju untuk terikat oleh persyaratan berikut:",
      "1. Penggunaan Layanan: Aplikasi ini berfungsi sebagai perantara pihak ketiga (third-party intermediary) yang aman untuk mengelola file pada cloud storage Telegram Anda.",
      "2. Tanggung Jawab Konten: Anda bertanggung jawab penuh atas semua data dan file yang Anda unggah. Kami tidak memantau, menyortir, atau mengontrol user content.",
      "3. Batasan Layanan: Kinerja dan ketersediaan layanan ini bergantung pada infrastruktur third-party server. Kami berhak membatasi atau menghentikan akses jika ditemukan abuse.",
      "4. Kepatuhan Hukum: Anda dilarang menggunakan layanan ini untuk tujuan ilegal, mendistribusikan malware, atau aktivitas yang melanggar hukum serta Terms of Service platform terkait."
    ],
    privacyTitle: "Kebijakan Privasi",
    privacyContent: [
      "Kami sangat menghargai privasi dan keamanan data Anda. Berikut adalah cara kami menangani data Anda:",
      "1. Session Storage: Authentication credentials Anda diproses secara aman menggunakan multi-layered encryption untuk mempertahankan login state Anda. Data session ini hanya digunakan secara internal untuk memfasilitasi akses Anda.",
      "2. Keamanan Transmisi: Semua data traffic dan file yang Anda unggah diamankan secara ketat. Proses transmisi ke cloud storage tujuan dilakukan menggunakan koneksi aman (End-to-End Encrypted) sesuai standar enkripsi industri.",
      "3. Privasi Penuh: Aplikasi ini tidak memiliki third-party trackers, dan kami berkomitmen penuh untuk tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak luar.",
      "4. Transparansi Data: File dan media yang Anda unggah tidak disalin atau disimpan secara permanen di local database kami. Data Anda sepenuhnya berada dalam kendali personal account Anda."
    ],
    close: "Tutup / Mengerti",
    newBtn: "Baru",
    newFolder: "Folder Baru",
    uploadFile: "Unggah File",
    myFiles: "File Saya",
    storageCapacity: "Kapasitas Penyimpanan",
    unlimited: "Unlimited",
    searchInFolder: "Cari...",
    name: "Nama",
    size: "Ukuran",
    date: "Tanggal",
    listView: "Tampilan Baris",
    gridView: "Tampilan Kotak",
    dropToUpload: "Tarik dan lepas file ke sini, atau klik untuk memilih",
    dropSubtitle: "File akan diunggah ke folder saat ini",
    copyLink: "Salin Tautan",
    download: "Unduh",
    rename: "Ubah Nama",
    deleteFile: "Hapus File",
    successCopy: "Tautan unduhan berhasil disalin!",
    enterNewName: "Masukkan nama baru untuk",
    confirmDelete: "Yakin ingin menghapus",
    cancel: "Batal",
    close: "Tutup",
    create: "Buat",
    account: "Akun Anda",
    connectedToTelegram: "Terhubung ke Telegram",
    profile: "Profil",
    about: "Tentang",
    logout: "Keluar",
    version: "Versi 1.0.0",
    footerCopyright: `© ${new Date().getFullYear()} Vabyo. Proyek Open Source. Aplikasi ini tidak resmi dan tidak berafiliasi dengan Telegram.`,
    aboutDesc: "Telegram Drive Storage adalah solusi penyimpanan awan modern yang memanfaatkan keandalan dan kapasitas tak terbatas dari Telegram API sebagai backend penyimpanan Anda.",
    createdBy: "Dibuat oleh",
    dragSubtitle: "Mendukung semua format file hingga 2 GB per file",
    noResults: "Tidak ada hasil untuk",
    folder: "Folder",
    registeredPhone: "Nomor Handphone Terdaftar",
    notAvailable: "Tidak tersedia",
    format: "Format",
    action: "Aksi",
    recent: "Terbaru",
    starred: "Berbintang",
    gallery: "Galeri Foto",
    trash: "Sampah",
    emptyTrash: "Kosongkan Sampah",
    trashSubtitle: "Item di Sampah akan dihapus secara permanen setelah 30 hari."
  },
  en: {
    loginTitle: "Login Telegram",
    phoneNumber: "Phone Number",
    sendOTP: "Send OTP Code",
    verifyCode: "Verification Code",
    verifySubtitle: "Check your Telegram app for the code from the system.",
    verifyBtn: "Verify & Login",
    passwordTitle: "Password (2-Step Verification)",
    passwordPlaceholder: "Enter password...",
    finishLogin: "Complete Login",
    e2ee: "End-to-End Encrypted (E2EE)",
    agree1: "By logging in, you agree to our ",
    agree2: "Terms of Service",
    agree3: " and ",
    agree4: "Privacy Policy",
    agree5: ".",
    searchPlaceholder: "Search code or country...",
    notFound: "Country not found",
    termsTitle: "Terms of Service",
    termsContent: [
      "Welcome to Telegram Drive Storage. By using this service, you agree to be bound by the following terms:",
      "1. Service Usage: This application serves as a secure third-party intermediary to manage files on your cloud storage.",
      "2. Content Responsibility: You are solely responsible for all data and files you upload. We do not monitor, moderate, or control user content.",
      "3. Service Limitations: The performance and availability of this service rely on third-party server infrastructure. We reserve the right to limit or terminate access in cases of abuse.",
      "4. Legal Compliance: You are prohibited from using this service for illegal purposes, distributing malicious software, or engaging in activities that violate laws or related platform terms."
    ],
    privacyTitle: "Privacy Policy",
    privacyContent: [
      "We highly value your privacy and data security. Here is how we handle your data:",
      "1. Session Storage: Your authentication credentials are processed securely using multi-layered encryption to maintain your logged-in state. This session data is used strictly internally to facilitate your access.",
      "2. Transmission Security: All data traffic and files you upload are strictly secured. The transmission process to the destination cloud storage utilizes secure connections matching industry encryption standards.",
      "3. Absolute Privacy: This application contains no third-party trackers, and we are fully committed to never selling, renting, or sharing your personal data with outside entities.",
      "4. Data Transparency: Files and media you upload are not permanently copied or stored in our local database. Your data remains entirely under the control of your personal account."
    ],
    close: "Close & Understand",
    newBtn: "New",
    newFolder: "New Folder",
    uploadFile: "Upload File",
    myFiles: "My Files",
    storageCapacity: "Storage Capacity",
    unlimited: "Unlimited",
    searchInFolder: "Search...",
    name: "Name",
    size: "Size",
    date: "Date",
    listView: "List View",
    gridView: "Grid View",
    dropToUpload: "Drag and drop files here, or click to select",
    dropSubtitle: "Files will be uploaded to the current folder",
    copyLink: "Copy Link",
    download: "Download",
    rename: "Rename",
    deleteFile: "Delete File",
    successCopy: "Download link copied successfully!",
    enterNewName: "Enter new name for",
    confirmDelete: "Are you sure you want to delete",
    cancel: "Cancel",
    close: "Close",
    create: "Create",
    account: "Your Account",
    connectedToTelegram: "Connected to Telegram",
    profile: "Profile",
    about: "About",
    logout: "Log out",
    version: "Version 1.0.0",
    footerCopyright: `© ${new Date().getFullYear()} Vabyo. Open Source Project. This is an unofficial app and is not affiliated with Telegram.`,
    aboutDesc: "Telegram Drive Storage is a modern cloud storage solution leveraging the reliability and unlimited capacity of the Telegram API as your storage backend.",
    createdBy: "Created by",
    dragSubtitle: "Supports all file formats up to 2 GB per file",
    noResults: "No results for",
    folder: "Folder",
    registeredPhone: "Registered Phone Number",
    notAvailable: "Not available",
    format: "Format",
    action: "Action",
    recent: "Recent",
    starred: "Starred",
    gallery: "Photo Gallery",
    trash: "Trash",
    emptyTrash: "Empty Trash",
    trashSubtitle: "Items in Trash will be permanently deleted after 30 days."
  }
};

const getRemainingDays = (deletedAt) => {
  if (!deletedAt) return 30;
  const delDate = new Date(deletedAt.replace(' ', 'T') + 'Z');
  const targetDate = new Date(delDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const diffDays = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [countryCode, setCountryCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [lang, setLang] = useState('en');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const dropdownRef = useRef(null);
  const t = dict[lang];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('.action-menu-container')) {
        setActiveActionMenu(null);
      }
      if (!event.target.closest('.custom-context-menu')) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [activeActionMenu, setActiveActionMenu] = useState(null);

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Root' }]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const isInTrash = currentFilter === 'trash' || breadcrumbs.some(b => b.isDeleted);

  const [stats, setStats] = useState({ totalSize: 0, totalFiles: 0 });
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('tg_drive_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    const savedLang = localStorage.getItem('tg_drive_lang');
    if (savedLang) {
      setLang(savedLang);
    }
    const savedViewMode = localStorage.getItem('tg_drive_viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tg_drive_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tg_drive_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (!isInitialLoad) {
      sessionStorage.setItem('tg_drive_folderId', currentFolderId || '');
      sessionStorage.setItem('tg_drive_breadcrumbs', JSON.stringify(breadcrumbs));
    }
  }, [currentFolderId, breadcrumbs, isInitialLoad]);

  const [viewMode, setViewMode] = useState('list');
  const [sortConfig, setSortConfig] = useState({ key: 'name', order: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const longPressTriggeredRef = useRef(false);
  const touchTimerRef = useRef(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: '', title: '', message: '', defaultValue: '', inputValue: '', onConfirm: null });

  // Drag selection state
  const [selectionBox, setSelectionBox] = useState(null);
  const mainContentRef = useRef(null);
  const selectionStartRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!selectionBox || !mainContentRef.current) return;

      const rect = mainContentRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left + mainContentRef.current.scrollLeft;
      const currentY = e.clientY - rect.top + mainContentRef.current.scrollTop;

      setSelectionBox(prev => {
        if (!prev) return null;
        return { ...prev, currentX, currentY };
      });

      const startX = Math.min(selectionStartRef.current.x, currentX);
      const startY = Math.min(selectionStartRef.current.y, currentY);
      const endX = Math.max(selectionStartRef.current.x, currentX);
      const endY = Math.max(selectionStartRef.current.y, currentY);

      const selectables = mainContentRef.current.querySelectorAll('.selectable-item');
      const newSelected = new Set();

      selectables.forEach(el => {
        const elRect = el.getBoundingClientRect();
        const elStartX = elRect.left - rect.left + mainContentRef.current.scrollLeft;
        const elStartY = elRect.top - rect.top + mainContentRef.current.scrollTop;
        const elEndX = elStartX + elRect.width;
        const elEndY = elStartY + elRect.height;

        if (
          startX < elEndX &&
          endX > elStartX &&
          startY < elEndY &&
          endY > elStartY
        ) {
          const id = el.getAttribute('data-id');
          if (id) newSelected.add(id);
        }
      });

      setSelectedItems(newSelected);
    };

    const handleMouseUp = () => {
      if (selectionBox) setSelectionBox(null);
    };

    const handleMouseLeave = (e) => {
      // If mouse leaves the document window, cancel drag
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        if (selectionBox) setSelectionBox(null);
      }
    };

    const handleDragStart = () => {
      if (selectionBox) setSelectionBox(null);
    };

    if (selectionBox) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('dragstart', handleDragStart);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, [selectionBox]);

  const handleMouseDownOnMain = (e) => {
    if (e.button !== 0) return;

    // Ignore if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('.selectable-item') || e.target.closest('.dropdown-menu') || e.target.closest('.breadcrumbs') || e.target.closest('.modal-content') || e.target.closest('.topbar')) {
      return;
    }

    if (!mainContentRef.current) return;

    // Disable if there are no selectable items
    if (mainContentRef.current.querySelectorAll('.selectable-item').length === 0) {
      return;
    }

    const rect = mainContentRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left + mainContentRef.current.scrollLeft;
    const startY = e.clientY - rect.top + mainContentRef.current.scrollTop;

    selectionStartRef.current = { x: startX, y: startY };
    setSelectionBox({ startX, startY, currentX: startX, currentY: startY });

    if (!e.ctrlKey && !e.shiftKey) {
      setSelectedItems(new Set());
    }
  };

  const showDialog = (type, title, message, defaultValue = '') => {
    return new Promise((resolve) => {
      setDialogConfig({
        isOpen: true,
        type,
        title,
        message,
        defaultValue,
        inputValue: defaultValue,
        onConfirm: (val) => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(val);
        }
      });
    });
  };

  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, type: 'general', item: null, targetType: null });

  // Folder selector modal for move/copy
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationModalAction, setDestinationModalAction] = useState(null); // 'move' or 'copy'
  const [destinationModalTargets, setDestinationModalTargets] = useState([]); // Array of {id, name/filename, _type}
  const [allFoldersList, setAllFoldersList] = useState([]);
  const [destinationModalLoading, setDestinationModalLoading] = useState(false);

  const calculateMenuPosition = (x, y) => {
    const menuWidth = 220;
    const menuHeight = 280; // Estimated height for largest menu
    const padding = 12;

    let adjustedX = x;
    let adjustedY = y;

    if (typeof window !== 'undefined') {
      if (x + menuWidth > window.innerWidth) {
        adjustedX = window.innerWidth - menuWidth - padding;
      }
      if (y + menuHeight > window.innerHeight) {
        adjustedY = window.innerHeight - menuHeight - padding;
      }
    }

    return { x: adjustedX, y: adjustedY };
  };

  const handleGlobalContextMenu = (e) => {
    if (e.target.closest('.modal-content') || e.target.closest('.file-card') || e.target.closest('.folder-card')) return;
    e.preventDefault();
    if (e.target.closest('.sidebar') || e.target.closest('.topbar')) return;
    if (contextMenu.isOpen) setContextMenu(prev => ({ ...prev, isOpen: false }));
    setSelectedItems(new Set());
    const { x, y } = calculateMenuPosition(e.pageX, e.pageY);
    setTimeout(() => {
      setContextMenu({ isOpen: true, x, y, type: 'general', item: null, targetType: null });
    }, 10);
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else {
      newSelected.add(id);
      setLastSelectedId(id);
    }
    setSelectedItems(newSelected);
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    if (longPressTriggeredRef.current) return;
    if (contextMenu.isOpen) setContextMenu(prev => ({ ...prev, isOpen: false }));

    const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    if (isMobile) {
      if (selectedItems.size > 0) toggleSelection(item.id);
      else {
        if (item.filename) setPreviewFile(item);
        else navigateToFolder(item.id, item.name, item.isDeleted);
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) toggleSelection(item.id);
    else if (e.shiftKey && lastSelectedId) {
      const allItems = [...filteredFolders.map(f => ({ ...f, _type: 'folder' })), ...filteredFiles.map(f => ({ ...f, _type: 'file' }))];
      const currentIndex = allItems.findIndex(i => i.id === item.id);
      const lastIndex = allItems.findIndex(i => i.id === lastSelectedId);
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const newSelected = new Set(selectedItems);
        for (let i = start; i <= end; i++) newSelected.add(allItems[i].id);
        setSelectedItems(newSelected);
      }
    } else {
      setSelectedItems(new Set([item.id]));
      setLastSelectedId(item.id);
    }
  };

  const handleItemDoubleClick = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isMobile) return;

    if (item.filename) setPreviewFile(item);
    else navigateToFolder(item.id, item.name, item.isDeleted);
  };

  const handleTouchStart = (e, item) => {
    longPressTriggeredRef.current = false;
    touchTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      if (!selectedItems.has(item.id)) {
        toggleSelection(item.id);
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => { if (touchTimerRef.current) clearTimeout(touchTimerRef.current); };
  const handleTouchMove = () => { if (touchTimerRef.current) clearTimeout(touchTimerRef.current); };

  const handleItemContextMenu = (e, type, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (contextMenu.isOpen) setContextMenu(prev => ({ ...prev, isOpen: false }));

    if (!selectedItems.has(item.id)) {
      setSelectedItems(new Set([item.id]));
      setLastSelectedId(item.id);
    }

    const { x, y } = calculateMenuPosition(e.pageX, e.pageY);
    setTimeout(() => {
      setContextMenu({ isOpen: true, x, y, type: 'item', item, targetType: type });
    }, 10);
  };

  useEffect(() => {
    localStorage.setItem('tg_drive_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!isInitialLoad) {
      const delayDebounceFn = setTimeout(() => {
        fetchData(currentFolderId, searchQuery, currentFilter);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthorized(data.isAuthorized);
      if (data.isAuthorized) {
        setCurrentUser(data.user);

        let initFolderId = null;
        if (typeof window !== 'undefined') {
          const savedFolderId = sessionStorage.getItem('tg_drive_folderId');
          const savedBreadcrumbs = sessionStorage.getItem('tg_drive_breadcrumbs');
          if (savedFolderId) {
            initFolderId = savedFolderId;
            setCurrentFolderId(initFolderId);
          }
          if (savedBreadcrumbs) {
            try { setBreadcrumbs(JSON.parse(savedBreadcrumbs)); } catch (e) { }
          }
        }

        fetchData(initFolderId);
        fetchStats();
      }
    } catch (e) {
      console.error(e);
      setIsAuthorized(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats({ totalSize: data.totalSize, totalFiles: data.totalFiles });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async (folderId, search = '', filter = null) => {
    setSelectedItems(new Set());
    setIsFetching(true);
    setFiles([]);
    setFolders([]);
    try {
      const qs = new URLSearchParams();
      if (folderId) qs.append('folderId', folderId);
      if (search) qs.append('search', search);
      if (filter) qs.append('filter', filter);

      const qsFolder = new URLSearchParams();
      if (folderId) qsFolder.append('parentId', folderId);
      if (search) qsFolder.append('search', search);
      if (filter) qsFolder.append('filter', filter);

      const [resFiles, resFolders] = await Promise.all([
        fetch('/api/files?' + qs.toString(), { cache: 'no-store' }),
        fetch('/api/folders?' + qsFolder.toString(), { cache: 'no-store' })
      ]);

      const dataFiles = await resFiles.json();
      const dataFolders = await resFolders.json();

      if (dataFiles.success) setFiles(dataFiles.files);
      if (dataFolders.success) setFolders(dataFolders.folders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolderId })
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName('');
        setShowFolderModal(false);
        fetchData(currentFolderId, searchQuery, currentFilter);
      } else {
        showDialog('alert', 'Gagal', "Gagal membuat folder: " + data.error);
      }
    } catch (e) {
      showDialog('alert', 'Error', "Error: " + e.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const navigateToFolder = (folderId, folderName, isDeleted = false) => {
    setCurrentFolderId(folderId);
    setCurrentFilter(null);
    setSearchQuery('');
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Root', isDeleted: false }]);
    } else {
      const index = breadcrumbs.findIndex(b => b.id === folderId);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      } else {
        const parentIsDeleted = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].isDeleted : false;
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName, isDeleted: isDeleted || parentIsDeleted }]);
      }
    }
    fetchData(folderId, '', null);
  };

  const handleAction = async (e, type, id, action) => {
    e.stopPropagation();
    setActiveActionMenu(null);

    if (action === 'restore' && type === 'file' && currentFilter !== 'trash' && isInTrash) {
      showDialog('alert', 'Perhatian', 'Harap pulihkan folder utamanya terlebih dahulu untuk memulihkan file di dalamnya.');
      return;
    }

    try {
      const res = await fetch(`/api/${type}s/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchData(currentFolderId, searchQuery, currentFilter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action) => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
    const ids = Array.from(selectedItems);
    const allItems = [...folders.map(f => ({ ...f, _type: 'folder' })), ...files.map(f => ({ ...f, _type: 'file' }))];
    const itemsToProcess = allItems.filter(i => ids.includes(i.id));

    if (action === 'move' || action === 'copy') {
      setDestinationModalAction(action);
      setDestinationModalTargets(itemsToProcess);
      openDestinationModal();
      return;
    }

    if (action === 'restore' && currentFilter !== 'trash' && isInTrash) {
      const hasFiles = itemsToProcess.some(i => i._type === 'file');
      if (hasFiles) {
        showDialog('alert', 'Perhatian', 'Harap pulihkan folder utamanya terlebih dahulu untuk memulihkan file di dalamnya.');
        return;
      }
    }

    try {
      for (const item of itemsToProcess) {
        await fetch(`/api/${item._type}s/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      }
      fetchData(currentFolderId, searchQuery, currentFilter);
      if (action !== 'star' && action !== 'unstar') setSelectedItems(new Set());
    } catch (err) {
      showDialog('alert', 'Error', 'Gagal memproses beberapa item.');
    }
  };

  const handleBulkDownload = async () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
    const ids = Array.from(selectedItems);
    const itemsToDownload = files.filter(f => ids.includes(f.id));
    if (itemsToDownload.length === 0) return;
    showDialog('alert', 'Mulai Mengunduh', `Memulai unduhan untuk ${itemsToDownload.length} file...`);
    for (const file of itemsToDownload) {
      const a = document.createElement('a');
      a.href = `/api/download/${file.id}`;
      a.download = file.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // slight delay to not crash browser
      await new Promise(r => setTimeout(r, 500));
    }
    setSelectedItems(new Set());
  };

  const openDestinationModal = async () => {
    try {
      const res = await fetch('/api/folders?fetchAll=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setAllFoldersList(data.folders || []);
        setShowDestinationModal(true);
      }
    } catch (err) {
      console.error(err);
      showDialog('alert', 'Error', 'Gagal memuat daftar folder.');
    }
  };

  const executeDestinationAction = async (targetFolderId) => {
    setShowDestinationModal(false);
    // filter out targets that are folders moving into themselves
    const validTargets = destinationModalTargets.filter(t => t._type !== 'folder' || t.id !== targetFolderId);

    if (validTargets.length === 0) return;

    setIsFetching(true);
    try {
      for (const item of validTargets) {
        const endpoint = `/api/${item._type}s/${item.id}/${destinationModalAction}`;
        const res = await fetch(endpoint, {
          method: destinationModalAction === 'copy' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetFolderId })
        });
        const data = await res.json();
        if (!res.ok || (data && !data.success)) {
          throw new Error(data.error || 'Terjadi kesalahan di server');
        }
      }
      fetchData(currentFolderId, searchQuery, currentFilter);
      setSelectedItems(new Set());
    } catch (err) {
      console.error(err);
      showDialog('alert', 'Error', err.message || 'Terjadi kesalahan saat memproses.');
    }
  };

  const handleDragStart = (e, item) => {
    // If dragging an item that isn't selected, just drag that single item
    // If dragging a selected item, drag all selected items
    let dragItems = [];
    if (selectedItems.has(item.id)) {
      const allItems = [...folders.map(f => ({ ...f, _type: 'folder' })), ...files.map(f => ({ ...f, _type: 'file' }))];
      dragItems = allItems.filter(i => selectedItems.has(i.id));
    } else {
      dragItems = [{ ...item, _type: item.mimeType ? 'file' : 'folder' }];
    }

    e.dataTransfer.setData('text/plain', JSON.stringify(dragItems));
    e.dataTransfer.effectAllowed = 'move';

    // Create custom ghost image
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.backgroundColor = 'var(--bg-surface)';
    ghost.style.padding = '8px 16px';
    ghost.style.borderRadius = '8px';
    ghost.style.boxShadow = 'var(--shadow-lg)';
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.gap = '8px';
    ghost.style.color = 'var(--text-primary)';
    ghost.style.fontFamily = 'inherit';
    ghost.style.fontSize = '14px';
    ghost.style.fontWeight = '500';
    ghost.style.border = '1px solid var(--border-light)';
    ghost.style.zIndex = '9999';

    const isFolder = !item.mimeType;
    const svgIcon = isFolder ?
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#f59e0b"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>' :
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="#3b82f6"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>';

    const text = dragItems.length > 1 ? `${dragItems.length} item` : (item.name || item.filename);
    ghost.innerHTML = `${svgIcon}<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${text}</span>`;

    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 15, 15);

    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const handleMoveDrop = async (e, targetFolderId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const dragItems = JSON.parse(dataStr);

      // Prevent moving folder into itself
      const validTargets = dragItems.filter(t => t._type !== 'folder' || t.id !== targetFolderId);
      if (validTargets.length === 0) return;

      let folderName = "direktori utama";
      if (targetFolderId) {
        const targetFolder = folders.find(f => f.id === targetFolderId);
        if (targetFolder) {
          folderName = `folder "${targetFolder.name}"`;
        } else {
          // If we drag to breadcrumb parent which is not in the current folders list
          // we might need to find it from breadcrumbs or just say 'folder tersebut'
          const crumb = breadcrumbs.find(b => b.id === targetFolderId);
          if (crumb) folderName = `folder "${crumb.name}"`;
          else folderName = "folder tersebut";
        }
      }

      const confirm = await showDialog('confirm', 'Pindahkan', `Pindahkan ${validTargets.length} item ke ${folderName}?`);
      if (!confirm) return;

      setIsFetching(true);
      for (const item of validTargets) {
        const endpoint = `/api/${item._type}s/${item.id}/move`;
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetFolderId })
        });
        const data = await res.json();
        if (!res.ok || (data && !data.success)) {
          throw new Error(data.error || 'Terjadi kesalahan di server');
        }
      }
      fetchData(currentFolderId, searchQuery, currentFilter);
      setSelectedItems(new Set());
    } catch (err) {
      console.error(err);
      showDialog('alert', 'Error', err.message || 'Gagal memindahkan file.');
    }
  };

  const handleBulkDelete = async () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
    const confirm = await showDialog('confirm', 'Hapus', `Yakin ingin menghapus ${selectedItems.size} item${isInTrash ? ' secara permanen dari Telegram? Tindakan ini tidak dapat dibatalkan.' : ' ke Sampah?'}`);
    if (!confirm) return;
    const ids = Array.from(selectedItems);
    const allItems = [...folders.map(f => ({ ...f, _type: 'folder' })), ...files.map(f => ({ ...f, _type: 'file' }))];
    const itemsToDelete = allItems.filter(i => ids.includes(i.id));
    try {
      for (const item of itemsToDelete) {
        if (isInTrash) {
          await fetch(`/api/${item._type}s/${item.id}`, { method: 'DELETE' });
        } else {
          await fetch(`/api/${item._type}s/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'trash' }) });
        }
      }
      fetchData(currentFolderId, searchQuery, currentFilter);
      setSelectedItems(new Set());
    } catch (err) {
      showDialog('alert', 'Error', 'Gagal menghapus beberapa item.');
    }
  };

  const handleDelete = async (e, type, id, name) => {
    e.stopPropagation();
    setActiveActionMenu(null);

    if (isInTrash) {
      const isFolder = type === 'folder';
      const warningText = isFolder
        ? `Hapus permanen folder "${name}" beserta seluruh isinya dari Telegram? Tindakan ini tidak dapat dibatalkan.`
        : `Hapus permanen file "${name}" dari Telegram? Tindakan ini tidak dapat dibatalkan.`;

      const confirm = await showDialog('confirm', 'Hapus Permanen', warningText);
      if (!confirm) return;
      try {
        const res = await fetch(`/api/${type}s/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          fetchData(currentFolderId, searchQuery, currentFilter);
          fetchStats();
        } else {
          showDialog('alert', 'Gagal', "Gagal menghapus: " + data.error);
        }
      } catch (err) {
        showDialog('alert', 'Error', "Error: " + err.message);
      }
    } else {
      const isFolder = type === 'folder';
      const warningText = isFolder
        ? `Pindahkan folder "${name}" ke Sampah?\n\nPERINGATAN: Semua file dan sub-folder di dalam folder ini juga akan ikut dipindahkan ke Sampah.`
        : `Pindahkan file "${name}" ke Sampah?`;

      const confirm = await showDialog('confirm', 'Pindahkan ke Sampah', warningText);
      if (!confirm) return;
      handleAction(e, type, id, 'trash');
    }
  };

  const handleRename = async (e, type, id, currentName) => {
    e.stopPropagation();
    setActiveActionMenu(null);

    let defaultPromptName = currentName;
    let extension = '';

    if (type === 'file') {
      const lastDotIndex = currentName.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        defaultPromptName = currentName.substring(0, lastDotIndex);
        extension = currentName.substring(lastDotIndex);
      }
    }

    let newName = await showDialog('prompt', 'Ubah Nama', `${t.enterNewName} ${type === 'folder' ? 'folder' : 'file'}:`, defaultPromptName);
    if (!newName) return;

    if (type === 'file' && !newName.endsWith(extension)) {
      newName += extension;
    }

    if (newName === currentName) return;

    try {
      const res = await fetch(`/api/${type}s/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (data.success) {
        fetchData(currentFolderId, searchQuery, currentFilter);
      } else {
        showDialog('alert', 'Gagal', "Gagal mengubah nama: " + data.error);
      }
    } catch (err) {
      showDialog('alert', 'Error', "Error: " + err.message);
    }
  }; const handleLogout = async () => {
    const confirm = await showDialog('confirm', 'Keluar', "Yakin ingin keluar? Sesi Anda akan dihapus dari server lokal ini.");
    if (!confirm) return;

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleEmptyTrash = async () => {
    const confirm = await showDialog('confirm', 'Kosongkan Sampah', 'Semua item di Sampah akan dihapus secara permanen dari Telegram. Tindakan ini tidak dapat dibatalkan.');
    if (!confirm) return;

    setIsFetching(true);
    try {
      const res = await fetch('/api/trash/empty', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setFiles([]);
        setFolders([]);
        showDialog('alert', 'Berhasil', 'Sampah telah dikosongkan.');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      showDialog('alert', 'Error', 'Gagal mengosongkan sampah: ' + err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fullPhoneNumber = countryCode + phoneNumber;
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber })
      });
      const data = await res.json();
      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash);
        setStep('code');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fullPhoneNumber = countryCode + phoneNumber;
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber, phoneCode, phoneCodeHash, password: step === 'password' ? password : undefined })
      });
      const data = await res.json();

      if (data.requiresPassword) {
        setStep('password');
        setLoading(false);
        return;
      }

      if (data.success) {
        setIsAuthorized(true);
        fetchData(currentFolderId);
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    // Only show upload overlay if dragging files from the OS (external drag)
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    // If it's an internal drag drop, ignore it here (handled by folder onDrop)
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('text/plain')) {
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files, value: null } });
    }
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setShowNewMenu(false);

    const newUploads = selectedFiles.map(file => {
      const uploadId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      return {
        id: uploadId,
        file,
        name: file.name,
        progress: 0,
        status: 'uploading',
        xhr: null,
        eventSource: null
      };
    });

    setUploadQueue(prev => [...prev, ...newUploads]);

    newUploads.forEach(uploadItem => {
      startUpload(uploadItem);
    });

    e.target.value = null;
  };

  const startUpload = (uploadItem) => {
    const formData = new FormData();
    formData.append('file', uploadItem.file);
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }
    formData.append('uploadId', uploadItem.id);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    const eventSource = new EventSource('/api/upload/progress?id=' + uploadItem.id);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setUploadQueue(prev => prev.map(item => {
          if (item.id === uploadItem.id) {
            return { ...item, progress: data.progress !== undefined ? data.progress : item.progress, status: data.status || item.status };
          }
          return item;
        }));

        if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
          eventSource.close();
          if (data.status === 'completed') {
            fetchData(currentFolderId, searchQuery, currentFilter);
            fetchStats();
            setTimeout(() => {
              setUploadQueue(prev => prev.filter(i => i.id !== uploadItem.id));
            }, 5000);
          }
        }
      } catch (err) { }
    };

    setUploadQueue(prev => prev.map(item => item.id === uploadItem.id ? { ...item, xhr, eventSource } : item));

    xhr.onload = () => {
      if (xhr.status !== 200) {
        setUploadQueue(prev => prev.map(item => item.id === uploadItem.id && item.status !== 'cancelled' ? { ...item, status: 'error' } : item));
        eventSource.close();
      }
    };

    xhr.onerror = () => {
      setUploadQueue(prev => prev.map(item => item.id === uploadItem.id && item.status !== 'cancelled' ? { ...item, status: 'error' } : item));
      eventSource.close();
    };

    xhr.send(formData);
  };

  const handleCancelUpload = async (id) => {
    setUploadQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        if (item.xhr) item.xhr.abort();
        if (item.eventSource) item.eventSource.close();
      }
      return prev.map(i => i.id === id ? { ...i, status: 'cancelled' } : i);
    });

    await fetch('/api/upload/progress?id=' + id, { method: 'DELETE' });

    setTimeout(() => {
      setUploadQueue(prev => prev.filter(i => i.id !== id));
    }, 2000);
  };

  if (isAuthorized === null || (isAuthorized && isInitialLoad)) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <Loader2 className="spin" size={40} color="var(--brand-primary)" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="auth-container">
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.8)', padding: '0.25rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid var(--border-light)' }}>
          <button onClick={() => setLang('id')} style={{ border: 'none', background: lang === 'id' ? 'var(--brand-primary)' : 'transparent', color: lang === 'id' ? '#fff' : 'var(--text-secondary)', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.85rem' }}>ID</button>
          <button onClick={() => setLang('en')} style={{ border: 'none', background: lang === 'en' ? 'var(--brand-primary)' : 'transparent', color: lang === 'en' ? '#fff' : 'var(--text-secondary)', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.85rem' }}>EN</button>
        </div>
        <div className="auth-panel">
          <div className="auth-header">
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, rgba(11,87,208,0.1) 0%, rgba(11,87,208,0.05) 100%)', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
              <Lock size={32} color="var(--brand-primary)" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{t.loginTitle}</h2>
          </div>

          {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center', background: 'var(--danger-bg)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem' }}>{error}</div>}

          {step === 'phone' && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">{t.phoneNumber}</label>
                <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <div
                      className="form-input"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', width: '125px', flexShrink: 0, justifyContent: 'space-between', padding: '0 0.75rem', height: '100%', borderColor: isDropdownOpen ? 'var(--brand-primary, #0b57d0)' : 'var(--border-light)', outline: isDropdownOpen ? '2px solid rgba(11, 87, 208, 0.2)' : 'none', transition: 'all 0.2s' }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{countryCodes.find(c => c.code === countryCode)?.iso || 'ID'}</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{countryCode}</span>
                      </div>
                      <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>

                    <div style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: 'var(--bg-surface, #fff)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '320px', zIndex: 100, border: '1px solid var(--border-light, #e2e8f0)',
                      opacity: isDropdownOpen ? 1 : 0, transform: isDropdownOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)', pointerEvents: isDropdownOpen ? 'auto' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '340px', transformOrigin: 'top left'
                    }}>
                      <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light, #e2e8f0)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-base, #f1f5f9)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                          <Search size={16} color="var(--text-secondary, #64748b)" style={{ marginRight: '0.5rem' }} />
                          <input
                            type="text" placeholder={t.searchPlaceholder} value={searchCountry} onChange={e => setSearchCountry(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 0' }} className="custom-scroll">
                        {countryCodes.filter(c => c.name.toLowerCase().includes(searchCountry.toLowerCase()) || c.code.includes(searchCountry)).map((country, index) => (
                          <div
                            key={`${country.iso}-${index}`}
                            onClick={() => { setCountryCode(country.code); setIsDropdownOpen(false); setSearchCountry(''); }}
                            style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'background 0.2s', background: countryCode === country.code ? 'rgba(11, 87, 208, 0.08)' : 'transparent' }}
                            onMouseOver={e => { if (countryCode !== country.code) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                            onMouseOut={e => { if (countryCode !== country.code) e.currentTarget.style.background = 'transparent' }}
                          >
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', width: '32px' }}>{country.iso}</span>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', flex: 1 }}>{country.name}</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{country.code}</span>
                          </div>
                        ))}
                        {countryCodes.filter(c => c.name.toLowerCase().includes(searchCountry.toLowerCase()) || c.code.includes(searchCountry)).length === 0 && (
                          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.notFound}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="8123456789"
                    required
                    style={{ flex: 1, fontSize: '1rem', letterSpacing: '0.5px' }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : t.sendOTP}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">{t.verifyCode}</label>
                <input
                  type="text"
                  className="form-input"
                  value={phoneCode}
                  onChange={e => setPhoneCode(e.target.value)}
                  placeholder="5 digits"
                  required
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{t.verifySubtitle}</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : t.verifyBtn}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">{t.passwordTitle}</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : t.finishLogin}
              </button>
            </form>
          )}

          <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Lock size={14} /> {t.e2ee}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t.agree1} <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>{t.agree2}</a>{t.agree3}<a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>{t.agree4}</a>{t.agree5}
            </div>
          </div>
        </div>

        {/* Terms of Service Modal */}
        {showTermsModal && (
          <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setShowTermsModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                {t.termsTitle}
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {t.termsContent.map((paragraph, idx) => (
                  <p key={idx} style={{ margin: 0 }}>{paragraph}</p>
                ))}
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowTermsModal(false)} className="btn btn-primary">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setShowPrivacyModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                {t.privacyTitle}
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {t.privacyContent.map((paragraph, idx) => (
                  <p key={idx} style={{ margin: 0 }}>{paragraph}</p>
                ))}
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowPrivacyModal(false)} className="btn btn-primary">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortItems = (items, type) => {
    return [...items].sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'name') {
        valA = (type === 'folder' ? a.name : a.filename).toLowerCase();
        valB = (type === 'folder' ? b.name : b.filename).toLowerCase();
      } else if (sortConfig.key === 'type') {
        valA = type === 'folder' ? 'folder' : (a.filename.includes('.') ? a.filename.split('.').pop().toLowerCase() : '');
        valB = type === 'folder' ? 'folder' : (b.filename.includes('.') ? b.filename.split('.').pop().toLowerCase() : '');
      } else if (sortConfig.key === 'size') {
        valA = a.size || 0;
        valB = b.size || 0;
      } else if (sortConfig.key === 'date') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (typeof valA === 'string') {
        return sortConfig.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortConfig.order === 'asc' ? valA - valB : valB - valA;
    });
  };

  const filteredFolders = sortItems(folders, 'folder');
  const filteredFiles = sortItems(files, 'file');

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentViewMode = currentFilter === 'media' ? 'grid' : viewMode;

  return (
    <div className="app-layout" onContextMenu={handleGlobalContextMenu}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-.08A7 7 0 1 0 5 15.61" /><path d="M15 19H5.5A3.5 3.5 0 1 1 9 16.5H15a3.5 3.5 0 1 1 0 7Z" /></svg>
          Telegram Drive Storage
        </div>

        <div className="btn-new-wrapper" style={{ position: 'relative' }}>
          <button className="btn-new" onClick={() => setShowNewMenu(!showNewMenu)}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#EA4335" d="M10 2h4v10h-4z" /><path fill="#4285F4" d="M10 12h4v10h-4z" /><path fill="#34A853" d="M2 10h10v4H2z" /><path fill="#FBBC05" d="M12 10h10v4H12z" /></svg>
            <span>{t.newBtn}</span>
          </button>

          {showNewMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNewMenu(false)}></div>
              <div style={{
                position: 'absolute', top: '100%', left: '1rem', marginTop: '0.25rem',
                background: theme === 'dark' ? '#1e293b' : '#ffffff', borderRadius: '12px', padding: '0.5rem 0',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', width: '220px', zIndex: 99999, border: '1px solid var(--border-light)'
              }}>
                <button
                  onClick={() => { setShowNewMenu(false); setShowFolderModal(true); }}
                  style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <FolderPlus size={18} color="var(--text-secondary)" /> {t.newFolder}
                </button>
                <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>
                <label
                  style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Upload size={18} color="var(--text-secondary)" /> {t.uploadFile}
                  <input type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>
            </>
          )}
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${!currentFilter && !isInTrash ? 'active' : ''}`}
            onClick={() => navigateToFolder(null, 'Root')}
            style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: !currentFilter && !isInTrash ? 'var(--brand-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: !currentFilter && !isInTrash ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: 500, borderRadius: '0 100px 100px 0', marginBottom: '0.25rem', transition: 'all 0.2s' }}
          >
            <HomeIcon size={20} /> {t.myFiles}
          </button>

          <button
            className={`nav-item ${currentFilter === 'recent' ? 'active' : ''}`}
            onClick={() => { setCurrentFilter('recent'); setCurrentFolderId(null); setBreadcrumbs([{ id: null, name: t.recent }]); fetchData(null, '', 'recent'); }}
            style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: currentFilter === 'recent' ? 'var(--brand-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: currentFilter === 'recent' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: 500, borderRadius: '0 100px 100px 0', marginBottom: '0.25rem', transition: 'all 0.2s' }}
          >
            <Clock size={20} /> {t.recent}
          </button>

          <button
            className={`nav-item ${currentFilter === 'starred' ? 'active' : ''}`}
            onClick={() => { setCurrentFilter('starred'); setCurrentFolderId(null); setBreadcrumbs([{ id: null, name: t.starred }]); fetchData(null, '', 'starred'); }}
            style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: currentFilter === 'starred' ? 'var(--brand-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: currentFilter === 'starred' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: 500, borderRadius: '0 100px 100px 0', marginBottom: '0.25rem', transition: 'all 0.2s' }}
          >
            <Star size={20} /> {t.starred}
          </button>

          <button
            className={`nav-item ${currentFilter === 'media' ? 'active' : ''}`}
            onClick={() => { setCurrentFilter('media'); setCurrentFolderId(null); setBreadcrumbs([{ id: null, name: t.gallery }]); fetchData(null, '', 'media'); }}
            style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: currentFilter === 'media' ? 'var(--brand-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: currentFilter === 'media' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: 500, borderRadius: '0 100px 100px 0', marginBottom: '0.25rem', transition: 'all 0.2s' }}
          >
            <ImageIcon size={20} /> {t.gallery}
          </button>

          <div style={{ margin: '1rem 0', height: '1px', background: 'var(--border-light)', width: 'calc(100% - 2rem)', marginLeft: '1rem' }}></div>

          <button
            className={`nav-item ${isInTrash ? 'active' : ''}`}
            onClick={() => { setCurrentFilter('trash'); setCurrentFolderId(null); setBreadcrumbs([{ id: null, name: t.trash }]); fetchData(null, '', 'trash'); }}
            style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: isInTrash ? 'var(--brand-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: isInTrash ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: 500, borderRadius: '0 100px 100px 0', transition: 'all 0.2s' }}
          >
            <Trash2 size={20} /> {t.trash}
          </button>
        </nav>

        <div className="storage-widget">
          <h4>{t.storageCapacity}</h4>
          <div className="storage-progress">
            <div className="storage-bar" style={{ width: '100%' }}></div>
          </div>
          <div className="storage-text">
            {formatSize(stats.totalSize)} / {t.unlimited}
          </div>
        </div>
      </aside>

      <main
        className="main-content"
        style={{ position: 'relative' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseDown={handleMouseDownOnMain}
        ref={mainContentRef}
      >
        {selectionBox && (
          <div style={{
            position: 'absolute',
            border: '1px solid var(--brand-primary)',
            backgroundColor: 'rgba(11, 87, 208, 0.1)',
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
            pointerEvents: 'none',
            zIndex: 1000
          }} />
        )}
        {isDragging && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 87, 208, 0.05)', border: '4px dashed var(--brand-primary)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', margin: '1rem', pointerEvents: 'none' }}>
            <div style={{ background: 'var(--bg-base)', padding: '2rem 4rem', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'var(--brand-bg-hover)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <Upload size={48} color="var(--brand-primary)" />
              </div>
              <h2 style={{ color: 'var(--brand-primary)', margin: 0, fontWeight: 600 }}>{t.dropToUpload}</h2>
            </div>
          </div>
        )}

        <header className="topbar">
          <div className="search-bar">
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder={t.searchInFolder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <div className="view-toggle">
              <button className={currentViewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title={t.listView}>
                <ListIcon size={18} />
              </button>
              <button className={currentViewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title={t.gridView}>
                <LayoutGrid size={18} />
              </button>
            </div>

            <button
              style={{
                background: 'var(--bg-base)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)',
                fontWeight: 600, padding: '0.5rem 0.75rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {lang.toUpperCase()}
            </button>

            <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div style={{ position: 'relative' }}>
              <div className="profile-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
                T
              </div>
              {showProfileMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfileMenu(false)}></div>
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                    background: theme === 'dark' ? '#1e293b' : '#ffffff', borderRadius: '8px', padding: '0.5rem 0',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', width: '220px', zIndex: 99999, border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.account}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.connectedToTelegram}</div>
                    </div>

                    <button onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                      <User size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} /> <span>{t.profile}</span>
                    </button>

                    <button onClick={() => { setShowAboutModal(true); setShowProfileMenu(false); }} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                      <Info size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} /> <span>{t.about}</span>
                    </button>

                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>

                    <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(217,48,37,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                      <LogOut size={16} style={{ flexShrink: 0 }} /> <span>{t.logout}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          <div className="content-header">
            <div className="breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.id || 'root'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className={`breadcrumb-btn ${idx === breadcrumbs.length - 1 ? 'active' : ''}`}
                    onClick={() => {
                      if (crumb.id === null) {
                        if (isInTrash || currentFilter === 'trash') {
                          setCurrentFilter('trash');
                          setCurrentFolderId(null);
                          setBreadcrumbs([{ id: null, name: t.trash }]);
                          fetchData(null, '', 'trash');
                          return;
                        }
                        if (currentFilter) return;
                      }
                      navigateToFolder(crumb.id, crumb.name, crumb.isDeleted);
                    }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over-folder'); }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        e.currentTarget.classList.remove('drag-over-folder');
                      }
                    }}
                    onDrop={(e) => { e.currentTarget.classList.remove('drag-over-folder'); handleMoveDrop(e, crumb.id); }}
                    style={{ cursor: (crumb.id === null && currentFilter) ? 'default' : 'pointer' }}
                  >
                    {crumb.id === null && !currentFilter && !isInTrash && <HomeIcon size={20} />}
                    {crumb.id === null && currentFilter === 'recent' && <Clock size={20} />}
                    {crumb.id === null && currentFilter === 'starred' && <Star size={20} />}
                    {crumb.id === null && currentFilter === 'media' && <ImageIcon size={20} />}
                    {crumb.id === null && (currentFilter === 'trash' || isInTrash) && <Trash2 size={20} />}
                    {crumb.name !== 'Root' && crumb.name}
                  </button>
                  {idx < breadcrumbs.length - 1 && <ChevronRight size={18} color="var(--text-secondary)" />}
                </span>
              ))}
            </div>
          </div>

          {currentFilter === 'trash' && (
            <div style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-secondary)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-light)' }}>
              <div>
                <Trash2 size={16} style={{ display: 'inline-block', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                {t.trashSubtitle}
              </div>
              <button
                onClick={handleEmptyTrash}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Trash2 size={14} />
                {t.emptyTrash}
              </button>
            </div>
          )}

          {/* Upload Dropzone inline */}
          {isFetching ? (
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, color: 'var(--brand-primary)' }}>
              <Loader2 className="spin" size={40} />
            </div>
          ) : filteredFolders.length === 0 && filteredFiles.length === 0 && !searchQuery && (
            currentFilter ? (
              <div className="empty-state" style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                {currentFilter === 'starred' && <Star size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />}
                {currentFilter === 'trash' && <Trash2 size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />}
                {currentFilter === 'media' && <ImageIcon size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />}
                {currentFilter === 'recent' && <Clock size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />}
                <p>Tidak ada file di sini.</p>
              </div>
            ) : (
              <label className="upload-zone">
                <Upload className="upload-icon" />
                <div>
                  <div className="upload-text">{t.dropToUpload}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{t.dragSubtitle}</div>
                </div>
                <input type="file" multiple className="file-input" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            )
          )}

          {searchQuery && filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="empty-state">
              <Search size={48} />
              <p>{t.noResults} "{searchQuery}"</p>
            </div>
          )}

          {(filteredFolders.length > 0 || filteredFiles.length > 0) && (
            <div className={currentViewMode === 'grid' ? 'files-grid' : 'files-list'}>
              {currentViewMode === 'list' && (
                <div className="list-header" style={{ display: 'flex', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <div style={{ width: '36px', marginRight: '1rem' }}></div>
                  <div style={{ flex: 1, display: 'flex', minWidth: 0, alignItems: 'center' }}>
                    <div
                      style={{ flex: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', gap: '0.25rem' }}
                      onClick={() => handleSort('name')}
                      title="Urutkan berdasarkan Nama"
                    >
                      {t.fileName || 'Nama'} {sortConfig.key === 'name' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                    </div>
                    <div
                      style={{ flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', gap: '0.25rem' }}
                      onClick={() => handleSort('type')}
                      title="Urutkan berdasarkan Format"
                    >
                      {t.format || 'Format'} {sortConfig.key === 'type' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                    </div>
                    <div
                      style={{ flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', gap: '0.25rem' }}
                      onClick={() => handleSort('size')}
                      title="Urutkan berdasarkan Ukuran"
                    >
                      {t.size || 'Ukuran'} {sortConfig.key === 'size' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                    </div>
                    <div
                      style={{ flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', gap: '0.25rem' }}
                      onClick={() => handleSort('date')}
                      title="Urutkan berdasarkan Tanggal"
                    >
                      {t.date || 'Tanggal'} {sortConfig.key === 'date' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                    </div>
                    <div style={{ width: '140px', marginLeft: '1rem', textAlign: 'right', color: 'transparent' }}>{t.action || 'Aksi'}</div>
                  </div>
                </div>
              )}
              {/* Render Folders First */}
              {filteredFolders.map((folder) => {
                const isSelected = selectedItems.has(folder.id);
                const gridStyle = {
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                  borderRadius: '16px', padding: '1rem',
                  border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-light)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', zIndex: activeActionMenu === folder.id ? 50 : 1
                };
                const listStyle = {
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                  borderBottom: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-light)',
                  cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
                  zIndex: activeActionMenu === folder.id ? 50 : 1
                };
                return (
                  <div
                    key={folder.id}
                    className={`folder-card file-card selectable-item ${isSelected ? 'selected' : ''}`}
                    data-id={folder.id}
                    onContextMenu={(e) => handleItemContextMenu(e, 'folder', folder)}
                    onClick={(e) => handleItemClick(e, folder)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, folder)}
                    onTouchStart={(e) => handleTouchStart(e, folder)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    draggable={!isInTrash}
                    onDragStart={(e) => { e.currentTarget.classList.add('dragging'); handleDragStart(e, folder); }}
                    onDragEnd={(e) => { e.currentTarget.classList.remove('dragging'); }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!e.currentTarget.classList.contains('drag-over-folder')) {
                        e.currentTarget.classList.add('drag-over-folder');
                      }
                    }}
                    onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over-folder'); }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        e.currentTarget.classList.remove('drag-over-folder');
                      }
                    }}
                    onDrop={(e) => { e.currentTarget.classList.remove('drag-over-folder'); handleMoveDrop(e, folder.id); }}
                    style={currentViewMode === 'grid' ? gridStyle : listStyle}
                  >
                    {currentViewMode === 'grid' ? (
                      <>
                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', flex: 1 }}>
                            <Folder size={20} color="var(--text-secondary)" />
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                              <div className="file-name" title={folder.name} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</div>
                              {isInTrash && folder.deletedAt && (
                                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                  <Clock size={12} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{getRemainingDays(folder.deletedAt)} hari tersisa</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {folder.isStarred ? <Star size={16} fill="#eab308" color="#eab308" style={{ flexShrink: 0 }} /> : null}
                            <div className="action-menu-container" onClick={e => e.stopPropagation()}>
                              <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleItemContextMenu(e, 'folder', folder); }}>
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="file-icon-wrapper folder-icon" style={{ background: 'var(--bg-base)', borderRadius: '12px', width: '100%', height: 'auto', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Folder size={48} color="var(--text-muted)" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="file-icon-wrapper folder-icon">
                          <Folder size={20} />
                        </div>
                        <div className="file-info">
                          <div className="file-name" title={folder.name} style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</span>
                            {isInTrash && folder.deletedAt && (
                              <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                <Clock size={12} /> {getRemainingDays(folder.deletedAt)} hari tersisa
                              </span>
                            )}
                          </div>
                          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.folder || 'Folder'}</div>
                          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>-</div>
                          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(folder.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div className="file-actions" onClick={e => e.stopPropagation()}>
                          {currentFilter === 'trash' ? (
                            <>
                              <button className="action-btn" title="Pulihkan" onClick={(e) => handleAction(e, 'folder', folder.id, 'restore')}>
                                <RotateCcw size={16} />
                              </button>
                              <button className="action-btn danger" title="Hapus Permanen" onClick={(e) => handleDelete(e, 'folder', folder.id, folder.name)}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className={`action-btn ${folder.isStarred ? 'persistent' : ''}`} title={folder.isStarred ? "Hapus Bintang" : "Beri Bintang"} onClick={(e) => handleAction(e, 'folder', folder.id, folder.isStarred ? 'unstar' : 'star')}>
                                <Star size={16} fill={folder.isStarred ? "#eab308" : "none"} color={folder.isStarred ? "#eab308" : "currentColor"} />
                              </button>
                              <button className="action-btn" title={t.rename} onClick={(e) => handleRename(e, 'folder', folder.id, folder.name)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="action-btn danger" title={t.deleteFile} onClick={(e) => handleDelete(e, 'folder', folder.id, folder.name)}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Render Files */}
              {filteredFiles.map((file) => {
                const lastDotIndex = file.filename.lastIndexOf('.');
                const hasExt = lastDotIndex > 0;
                const ext = hasExt ? file.filename.substring(lastDotIndex + 1).toLowerCase() : 'FILE';
                const nameWithoutExt = hasExt ? file.filename.substring(0, lastDotIndex) : file.filename;

                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                const isVideo = ['mp4', 'mkv', 'avi', 'mov'].includes(ext);
                const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
                const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
                const isDoc = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'].includes(ext);

                const iconSize = currentViewMode === 'grid' ? 48 : 24;
                let IconComponent = <FileIcon size={iconSize} color="var(--text-secondary)" />;
                if (isImage) IconComponent = <ImageIcon size={iconSize} color="#10b981" />;
                else if (isVideo) IconComponent = <Film size={iconSize} color="#ef4444" />;
                else if (isAudio) IconComponent = <Music size={iconSize} color="#8b5cf6" />;
                else if (isArchive) IconComponent = <Archive size={iconSize} color="#f59e0b" />;
                else if (isDoc) IconComponent = <FileText size={iconSize} color="#3b82f6" />;

                let SmallIconComponent = <FileIcon size={20} color="var(--text-secondary)" />;
                if (isImage) SmallIconComponent = <ImageIcon size={20} color="#10b981" />;
                else if (isVideo) SmallIconComponent = <Film size={20} color="#ef4444" />;
                else if (isAudio) SmallIconComponent = <Music size={20} color="#8b5cf6" />;
                else if (isArchive) SmallIconComponent = <Archive size={20} color="#f59e0b" />;
                else if (isDoc) SmallIconComponent = <FileText size={20} color="#3b82f6" />;

                const isSelected = selectedItems.has(file.id);
                const gridStyle = {
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                  borderRadius: '16px', padding: '1rem',
                  border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-light)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', zIndex: activeActionMenu === file.id ? 50 : 1
                };
                const listStyle = {
                  display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                  borderBottom: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-light)',
                  cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
                  zIndex: activeActionMenu === file.id ? 50 : 1
                };

                return (
                  <div
                    key={file.id}
                    className={`file-card selectable-item ${isSelected ? 'selected' : ''}`}
                    data-id={file.id}
                    onContextMenu={(e) => handleItemContextMenu(e, 'file', file)}
                    onClick={(e) => handleItemClick(e, file)}
                    onDoubleClick={(e) => handleItemDoubleClick(e, file)}
                    onTouchStart={(e) => handleTouchStart(e, file)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    draggable={!isInTrash}
                    onDragStart={(e) => { e.currentTarget.classList.add('dragging'); handleDragStart(e, file); }}
                    onDragEnd={(e) => { e.currentTarget.classList.remove('dragging'); }}
                    style={currentViewMode === 'grid' ? gridStyle : listStyle}
                  >
                    {currentViewMode === 'grid' ? (
                      <>
                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', flex: 1 }}>
                            {SmallIconComponent}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                              <div className="file-name" title={file.filename} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {nameWithoutExt}
                              </div>
                              {isInTrash && file.deletedAt && (
                                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                  <Clock size={12} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{getRemainingDays(file.deletedAt)} hari tersisa</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {file.isStarred ? <Star size={16} fill="#eab308" color="#eab308" style={{ flexShrink: 0 }} /> : null}
                            <div className="action-menu-container" onClick={e => e.stopPropagation()}>
                              <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleItemContextMenu(e, 'file', file); }}>
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="file-icon-wrapper" style={{ padding: isImage ? 0 : undefined, overflow: 'hidden', width: '100%', height: 'auto', aspectRatio: '1 / 1', background: 'var(--bg-base)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isImage ? (
                            <img src={`/api/download/${file.id}`} alt={file.filename} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} loading="lazy" />
                          ) : (
                            IconComponent
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="file-icon-wrapper">
                          {IconComponent}
                        </div>
                        <div className="file-info">
                          <div className="file-name" title={file.filename} style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nameWithoutExt}</span>
                            {isInTrash && file.deletedAt && (
                              <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                <Clock size={12} /> {getRemainingDays(file.deletedAt)} hari tersisa
                              </span>
                            )}
                          </div>
                          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ext.toUpperCase()}</div>
                          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{formatSize(file.size)}</div>
                          <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(file.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div className="file-actions" onClick={e => e.stopPropagation()}>
                          {currentFilter === 'trash' ? (
                            <>
                              <button className="action-btn" title="Pulihkan" onClick={(e) => handleAction(e, 'file', file.id, 'restore')}>
                                <RotateCcw size={16} />
                              </button>
                              <button className="action-btn danger" title="Hapus Permanen" onClick={(e) => handleDelete(e, 'file', file.id, file.filename)}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className={`action-btn ${file.isStarred ? 'persistent' : ''}`} title={file.isStarred ? "Hapus Bintang" : "Beri Bintang"} onClick={(e) => handleAction(e, 'file', file.id, file.isStarred ? 'unstar' : 'star')}>
                                <Star size={16} fill={file.isStarred ? "#eab308" : "none"} color={file.isStarred ? "#eab308" : "currentColor"} />
                              </button>
                              <button className="action-btn" title={t.copyLink} onClick={(e) => { e.stopPropagation(); const link = `${window.location.origin}/api/download/${file.id}`; navigator.clipboard.writeText(link); showDialog('alert', 'Berhasil', t.successCopy); }}>
                                <Copy size={16} />
                              </button>
                              <a href={`/api/download/${file.id}`} onClick={e => e.stopPropagation()} className="action-btn primary" title={t.download}>
                                <Download size={16} />
                              </a>
                              <button className="action-btn" title={t.rename} onClick={(e) => handleRename(e, 'file', file.id, file.filename)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="action-btn danger" title={t.deleteFile} onClick={(e) => handleDelete(e, 'file', file.id, file.filename)}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={() => setShowFolderModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>{t.newFolder}</h3>

            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Folder tanpa judul"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                style={{ padding: '0.5rem', fontSize: '0.95rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowFolderModal(false)} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', color: 'var(--brand-primary)', fontWeight: 500, cursor: 'pointer', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(11,87,208,0.04)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={creatingFolder || !newFolderName.trim()} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', color: creatingFolder || !newFolderName.trim() ? 'var(--text-muted)' : 'var(--brand-primary)', fontWeight: 500, cursor: creatingFolder || !newFolderName.trim() ? 'not-allowed' : 'pointer', borderRadius: '4px' }} onMouseOver={e => { if (!creatingFolder && newFolderName.trim()) e.currentTarget.style.background = 'rgba(11,87,208,0.04)' }} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  {creatingFolder ? <Loader2 size={16} className="spin" /> : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Dialog Modal */}
      {dialogConfig.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={() => dialogConfig.type === 'alert' && dialogConfig.onConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{dialogConfig.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>{dialogConfig.message}</p>

            {dialogConfig.type === 'prompt' && (
              <input
                type="text"
                className="form-input"
                value={dialogConfig.inputValue}
                onChange={e => setDialogConfig(prev => ({ ...prev, inputValue: e.target.value }))}
                autoFocus
                style={{ padding: '0.75rem', fontSize: '0.95rem', marginBottom: '1.5rem', width: '100%' }}
                onKeyDown={e => { if (e.key === 'Enter') dialogConfig.onConfirm(dialogConfig.inputValue); }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {dialogConfig.type !== 'alert' && (
                <button type="button" onClick={() => dialogConfig.onConfirm(dialogConfig.type === 'prompt' ? null : false)} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  Batal
                </button>
              )}
              <button type="button" onClick={() => dialogConfig.onConfirm(dialogConfig.type === 'prompt' ? dialogConfig.inputValue : true)} style={{ background: 'var(--brand-primary)', border: 'none', padding: '0.5rem 1rem', color: 'white', fontWeight: 500, cursor: 'pointer', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={e => e.currentTarget.style.filter = 'none'}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)} style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <button onClick={() => setPreviewFile(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <X size={24} />
          </button>

          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'transparent', border: 'none', boxShadow: 'none', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {(() => {
              const ext = previewFile.filename.includes('.') ? previewFile.filename.split('.').pop().toLowerCase() : '';
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

              if (isImage) {
                return (
                  <>
                    <img src={`/api/download/${previewFile.id}`} alt={previewFile.filename} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} loading="lazy" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: '100px', boxShadow: 'var(--shadow-lg)' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewFile.filename}</span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatSize(previewFile.size)}</span>
                      {isInTrash ? (
                        <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => { setPreviewFile(null); handleAction(e, 'file', previewFile.id, 'restore'); }}
                            style={{ background: 'var(--brand-bg)', color: 'var(--brand-primary)', padding: '0.5rem 1.25rem', borderRadius: '100px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                          >
                            <RotateCcw size={18} /> Pulihkan
                          </button>
                          <button
                            onClick={(e) => { setPreviewFile(null); handleDelete(e, 'file', previewFile.id, previewFile.filename); }}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem 1.25rem', borderRadius: '100px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                          >
                            <Trash2 size={18} /> Hapus
                          </button>
                        </div>
                      ) : (
                        <a
                          href={`/api/download/${previewFile.id}`}
                          style={{ marginLeft: '1rem', background: 'var(--brand-bg)', color: 'var(--brand-primary)', padding: '0.5rem 1.25rem', borderRadius: '100px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                        >
                          <Download size={18} /> {t.download}
                        </a>
                      )}
                    </div>
                  </>
                );
              }

              return (
                <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', minWidth: '320px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--bg-base)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileIcon size={40} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', wordBreak: 'break-all' }}>{previewFile.filename}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{formatSize(previewFile.size)} • {ext.toUpperCase() || 'FILE'}</p>
                  </div>
                  {isInTrash ? (
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                      <button
                        onClick={(e) => { setPreviewFile(null); handleAction(e, 'file', previewFile.id, 'restore'); }}
                        style={{ flex: 1, background: 'var(--brand-bg)', color: 'var(--brand-primary)', padding: '0.875rem', borderRadius: '12px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                      >
                        <RotateCcw size={20} /> Pulihkan
                      </button>
                      <button
                        onClick={(e) => { setPreviewFile(null); handleDelete(e, 'file', previewFile.id, previewFile.filename); }}
                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.875rem', borderRadius: '12px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        <Trash2 size={20} /> Hapus
                      </button>
                    </div>
                  ) : (
                    <a
                      href={`/api/download/${previewFile.id}`}
                      style={{ width: '100%', background: 'var(--brand-primary)', color: '#fff', padding: '0.875rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                      onMouseOut={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <Download size={20} /> {t.download}
                    </a>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>
              {currentUser?.firstName?.[0] || 'T'}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {currentUser?.firstName} {currentUser?.lastName || ''}
            </h3>
            {currentUser?.username && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>@{currentUser.username}</p>
            )}

            <div style={{ textAlign: 'center', background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t.registeredPhone}</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>+{currentUser?.phone || t.notAvailable}</div>
            </div>

            <button onClick={() => setShowProfileModal(false)} style={{ marginTop: '2rem', padding: '0.6rem 2rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '24px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <svg className="logo-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-.08A7 7 0 1 0 5 15.61" /><path d="M15 19H5.5A3.5 3.5 0 1 1 9 16.5H15a3.5 3.5 0 1 1 0 7Z" /></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Telegram Drive Storage</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center' }}>{t.version}</p>

            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {t.aboutDesc}
            </p>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <a href="https://instagram.com/v.vabyo" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="mailto:vebyvabyo@gmail.com" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t.footerCopyright}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setShowAboutModal(false)} style={{ padding: '0.5rem 1.5rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Selector Modal */}
      {showDestinationModal && (
        <div className="modal-overlay" onClick={() => setShowDestinationModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Pilih Tujuan ({destinationModalAction === 'copy' ? 'Salin' : 'Pindahkan'})</h2>

            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)', borderRadius: '8px', padding: '0.5rem', border: '1px solid var(--border-light)' }}>
              {destinationModalLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat folder...</div>
              ) : (
                <>
                  <div
                    onClick={() => executeDestinationAction(null)}
                    style={{ padding: '0.75rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Folder size={20} color="var(--brand-primary)" />
                    <span style={{ fontWeight: 600 }}>Root (Halaman Utama)</span>
                  </div>
                  {allFoldersList.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => executeDestinationAction(folder.id)}
                      style={{ padding: '0.75rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: folder.parentId ? '1.5rem' : '0' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Folder size={18} color="var(--text-secondary)" />
                      <span>{folder.name}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowDestinationModal(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Toast Indicator */}
      {uploadQueue.length > 0 && (
        <div className="upload-toast" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '360px', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', borderRadius: '16px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-base)', borderBottom: '1px solid var(--border-light)', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Mengunggah {uploadQueue.filter(u => u.status === 'uploading').length} item...</span>
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
            {uploadQueue.map(item => (
              <div key={item.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    {item.status === 'uploading' && <Loader2 className="spin" size={16} color="var(--brand-primary)" />}
                    {item.status === 'completed' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>}
                    {item.status === 'error' && <X size={16} color="var(--danger)" />}
                    {item.status === 'cancelled' && <X size={16} color="var(--text-muted)" />}
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.status === 'uploading' ? `${item.progress}%` : item.status === 'completed' ? 'Selesai' : item.status === 'cancelled' ? 'Dibatalkan' : 'Gagal'}
                    </span>
                    {item.status === 'uploading' && (
                      <button onClick={() => handleCancelUpload(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem', borderRadius: '50%' }}>
                        <X size={14} color="var(--text-secondary)" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="storage-progress" style={{ height: '4px', marginBottom: 0 }}>
                  <div className="storage-bar" style={{
                    width: `${item.progress}%`,
                    transition: 'width 0.2s',
                    background: item.status === 'error' || item.status === 'cancelled' ? 'var(--danger)' : item.status === 'completed' ? 'var(--success)' : 'var(--brand-primary)'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Global Context Menu */}
      {contextMenu.isOpen && (
        <div
          className="custom-context-menu dropdown-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            display: 'block',
            background: 'var(--bg-surface-hover)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            padding: '0.5rem 0',
            boxShadow: 'var(--shadow-lg)',
            width: '220px',
            border: '1px solid var(--border-light)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.type === 'general' && (
            <>
              <button className="dropdown-item" onClick={() => { setContextMenu(prev => ({ ...prev, isOpen: false })); setShowFolderModal(true); }}>
                <FolderPlus size={16} /> {t.newFolder}
              </button>
              <label className="dropdown-item" style={{ width: '100%', cursor: 'pointer', margin: 0 }}>
                <Upload size={16} /> {t.uploadFile}
                <input type="file" multiple style={{ display: 'none' }} onChange={(e) => { setContextMenu(prev => ({ ...prev, isOpen: false })); handleFileUpload(e); }} />
              </label>
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>
              <button className="dropdown-item" onClick={() => { setContextMenu(prev => ({ ...prev, isOpen: false })); fetchData(currentFolderId, searchQuery, currentFilter); }}>
                <RotateCcw size={16} /> Refresh
              </button>
            </>
          )}

          {contextMenu.type === 'item' && selectedItems.size > 1 ? (
            <>
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', marginBottom: '0.25rem' }}>
                {selectedItems.size} item dipilih
              </div>
              {isInTrash ? (
                <>
                  <button className="dropdown-item" onClick={() => handleBulkAction('restore')}>
                    <RotateCcw size={16} /> Pulihkan {selectedItems.size} Item
                  </button>
                  <button className="dropdown-item danger" onClick={() => handleBulkDelete()}>
                    <Trash2 size={16} /> Hapus Permanen {selectedItems.size} Item
                  </button>
                </>
              ) : (() => {
                const allList = [...folders, ...files];
                const selectedList = allList.filter(i => selectedItems.has(i.id));
                const starredCount = selectedList.filter(i => i.isStarred).length;
                const unstarredCount = selectedList.filter(i => !i.isStarred).length;
                return (
                  <>
                    {unstarredCount > 0 && (
                      <button className="dropdown-item" onClick={() => handleBulkAction('star')}>
                        <Star size={16} fill="none" /> Beri Bintang {unstarredCount} Item
                      </button>
                    )}
                    {starredCount > 0 && (
                      <button className="dropdown-item" onClick={() => handleBulkAction('unstar')}>
                        <Star size={16} fill="#eab308" color="#eab308" /> Hapus Bintang {starredCount} Item
                      </button>
                    )}
                    <button className="dropdown-item" onClick={() => handleBulkAction('copy')}>
                      <Copy size={16} /> Salin {selectedItems.size} Item
                    </button>
                    <button className="dropdown-item" onClick={() => handleBulkAction('move')}>
                      <Folder size={16} /> Pindahkan {selectedItems.size} Item
                    </button>
                    <button className="dropdown-item" onClick={() => handleBulkDownload()}>
                      <Download size={16} /> Unduh {selectedItems.size} Item
                    </button>
                    <button className="dropdown-item danger" onClick={() => handleBulkDelete()}>
                      <Trash2 size={16} /> Hapus {selectedItems.size} Item
                    </button>
                  </>
                );
              })()}
            </>
          ) : contextMenu.type === 'item' && selectedItems.size <= 1 && contextMenu.targetType === 'folder' && (
            isInTrash ? (
              <>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleAction(e, 'folder', contextMenu.item.id, 'restore'); }}>
                  <RotateCcw size={16} /> Pulihkan
                </button>
                <button className="dropdown-item danger" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleDelete(e, 'folder', contextMenu.item.id, contextMenu.item.name); }}>
                  <Trash2 size={16} /> Hapus Permanen
                </button>
              </>
            ) : (
              <>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleAction(e, 'folder', contextMenu.item.id, contextMenu.item.isStarred ? 'unstar' : 'star'); }}>
                  <Star size={16} fill={contextMenu.item.isStarred ? "#eab308" : "none"} color={contextMenu.item.isStarred ? "#eab308" : "currentColor"} /> {contextMenu.item.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                </button>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleRename(e, 'folder', contextMenu.item.id, contextMenu.item.name); }}>
                  <Edit2 size={16} /> {t.rename}
                </button>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); setDestinationModalAction('move'); setDestinationModalTargets([{ ...contextMenu.item, _type: 'folder' }]); openDestinationModal(); }}>
                  <Folder size={16} /> Pindahkan
                </button>
                <button className="dropdown-item danger" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleDelete(e, 'folder', contextMenu.item.id, contextMenu.item.name); }}>
                  <Trash2 size={16} /> Hapus Folder
                </button>
              </>
            )
          )}

          {contextMenu.type === 'item' && selectedItems.size <= 1 && contextMenu.targetType === 'file' && (
            isInTrash ? (
              <>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleAction(e, 'file', contextMenu.item.id, 'restore'); }}>
                  <RotateCcw size={16} /> Pulihkan
                </button>
                <button className="dropdown-item danger" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleDelete(e, 'file', contextMenu.item.id, contextMenu.item.filename); }}>
                  <Trash2 size={16} /> Hapus Permanen
                </button>
              </>
            ) : (
              <>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleAction(e, 'file', contextMenu.item.id, contextMenu.item.isStarred ? 'unstar' : 'star'); }}>
                  <Star size={16} fill={contextMenu.item.isStarred ? "#eab308" : "none"} color={contextMenu.item.isStarred ? "#eab308" : "currentColor"} /> {contextMenu.item.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                </button>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); setDestinationModalAction('copy'); setDestinationModalTargets([{ ...contextMenu.item, _type: 'file' }]); openDestinationModal(); }}>
                  <Copy size={16} /> Salin
                </button>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); setDestinationModalAction('move'); setDestinationModalTargets([{ ...contextMenu.item, _type: 'file' }]); openDestinationModal(); }}>
                  <Folder size={16} /> Pindahkan
                </button>
                <a href={`/api/download/${contextMenu.item.id}`} className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); }}>
                  <Download size={16} /> {t.download}
                </a>
                <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleRename(e, 'file', contextMenu.item.id, contextMenu.item.filename); }}>
                  <Edit2 size={16} /> {t.rename}
                </button>
                <button className="dropdown-item danger" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, isOpen: false })); handleDelete(e, 'file', contextMenu.item.id, contextMenu.item.filename); }}>
                  <Trash2 size={16} /> {t.deleteFile}
                </button>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
