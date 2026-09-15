// Language strings
export type Lang = 'id' | 'en';

type StringMap = {
  navHome: string; navExplore: string; navItinerary: string; navAssistant: string;
  heroTitle: string; heroTitleHighlight: string; heroSubtitle: string;
  searchCity: string; searchBtn: string; budgetLabel: string;
  howItWorks: string; step1Title: string; step1Desc: string;
  step2Title: string; step2Desc: string; step3Title: string; step3Desc: string;
  trending: string; trendingDesc: string;
  resultsFor: string; filterAll: string; filterNature: string; filterCulture: string;
  filterCulinary: string; filterShopping: string; filterEntertainment: string; filterFamily: string;
  noResults: string; selectedPlaces: string; createItinerary: string;
  addToTrip: string; remove: string; freeEntrance: string; estimatedCost: string;
  itineraryTitle: string; day: string; totalCost: string; exportPDF: string;
  shareLink: string; backToExplore: string; weatherIn: string;
  aiTitle: string; aiSubtitle: string; aiPlaceholder: string; aiSend: string;
};

export const strings: Record<Lang, StringMap> = {
  id: {
    // Navbar
    navHome: 'Beranda',
    navExplore: 'Jelajahi',
    navItinerary: 'Itinerary',
    navAssistant: 'AI Assistant',
    // Landing
    heroTitle: 'Temukan Wisata',
    heroTitleHighlight: 'Impianmu',
    heroSubtitle: 'Masukkan kota tujuan dan budget perjalananmu. Kami akan merekomendasikan tempat wisata terbaik dan membuatkan rute perjalanan otomatis untukmu.',
    searchCity: 'Nama kota tujuan...',
    searchBtn: 'Cari Wisata',
    budgetLabel: 'Budget Perjalanan',
    howItWorks: 'Cara Kerja',
    step1Title: 'Masukkan Kota & Budget',
    step1Desc: 'Ketik nama kota tujuanmu dan tentukan budget perjalanan yang dimiliki.',
    step2Title: 'Pilih Destinasi',
    step2Desc: 'Jelajahi dan tandai tempat-tempat wisata yang ingin kamu kunjungi.',
    step3Title: 'Dapatkan Itinerary',
    step3Desc: 'Engine kami otomatis membuat timeline dan rute perjalanan terbaik untukmu.',
    trending: 'Destinasi Trending',
    trendingDesc: 'Tempat wisata yang paling populer minggu ini',
    // Explore
    resultsFor: 'Hasil pencarian di',
    filterAll: 'Semua',
    filterNature: 'Alam',
    filterCulture: 'Budaya',
    filterCulinary: 'Kuliner',
    filterShopping: 'Belanja',
    filterEntertainment: 'Hiburan',
    filterFamily: 'Keluarga',
    noResults: 'Tidak ada destinasi ditemukan',
    selectedPlaces: 'Tempat Dipilih',
    createItinerary: 'Buat Itinerary',
    addToTrip: 'Tambah',
    remove: 'Hapus',
    freeEntrance: 'Gratis',
    estimatedCost: 'Est. Biaya',
    // Itinerary
    itineraryTitle: 'Itinerary Perjalananmu',
    day: 'Hari',
    totalCost: 'Total Estimasi Biaya',
    exportPDF: 'Export PDF',
    shareLink: 'Bagikan',
    backToExplore: 'Kembali',
    // Weather
    weatherIn: 'Cuaca di',
    // AI
    aiTitle: 'AI Travel Assistant',
    aiSubtitle: 'Tanya apa saja tentang perjalananmu',
    aiPlaceholder: 'Tanyakan sesuatu...',
    aiSend: 'Kirim',
  },
  en: {
    // Navbar
    navHome: 'Home',
    navExplore: 'Explore',
    navItinerary: 'Itinerary',
    navAssistant: 'AI Assistant',
    // Landing
    heroTitle: 'Discover Your',
    heroTitleHighlight: 'Dream Journey',
    heroSubtitle: 'Enter your destination city and travel budget. We\'ll recommend the best attractions and automatically create your travel route.',
    searchCity: 'Enter city name...',
    searchBtn: 'Find Attractions',
    budgetLabel: 'Travel Budget',
    howItWorks: 'How It Works',
    step1Title: 'Enter City & Budget',
    step1Desc: 'Type your destination city and set your travel budget.',
    step2Title: 'Choose Destinations',
    step2Desc: 'Browse and mark the attractions you want to visit.',
    step3Title: 'Get Your Itinerary',
    step3Desc: 'Our engine automatically creates the best timeline and travel route for you.',
    trending: 'Trending Destinations',
    trendingDesc: 'Most popular attractions this week',
    // Explore
    resultsFor: 'Results in',
    filterAll: 'All',
    filterNature: 'Nature',
    filterCulture: 'Culture',
    filterCulinary: 'Culinary',
    filterShopping: 'Shopping',
    filterEntertainment: 'Entertainment',
    filterFamily: 'Family',
    noResults: 'No destinations found',
    selectedPlaces: 'Selected Places',
    createItinerary: 'Create Itinerary',
    addToTrip: 'Add',
    remove: 'Remove',
    freeEntrance: 'Free',
    estimatedCost: 'Est. Cost',
    // Itinerary
    itineraryTitle: 'Your Travel Itinerary',
    day: 'Day',
    totalCost: 'Total Estimated Cost',
    exportPDF: 'Export PDF',
    shareLink: 'Share',
    backToExplore: 'Back',
    // Weather
    weatherIn: 'Weather in',
    // AI
    aiTitle: 'AI Travel Assistant',
    aiSubtitle: 'Ask anything about your journey',
    aiPlaceholder: 'Ask something...',
    aiSend: 'Send',
  },
};
