import { Injectable, signal, computed } from '@angular/core';
import { interval } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Interfaces ---
export interface BankInfo {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  branch: string;
  qrCodeUrl: string;
}

export interface Timings {
  suprabhatam: string;
  morningDarshan: string;
  breakTime: string;
  eveningDarshan: string;
  ekanthaSeva: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface SevaType {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface SiteConfig {
  templeName: string;
  subTitle: string;
  logoUrl: string;
  liveLink: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  mapEmbedUrl: string;
  whatsappChannel: string;
  historyContent: string;
  historyImageUrl: string;
  bankInfo: BankInfo;
  timings: Timings;
  enableBooking: boolean;
  enableHundi: boolean;
  maintenanceMode: boolean;
  theme: ThemeConfig;
  donationAmounts: number[];
  donationCategories: string[];
  seo: SeoConfig;
  socialLinks: { facebook?: string; instagram?: string; twitter?: string; youtube?: string };
}

export interface Panchangam {
  date: string;
  tithi: string;
  nakshatra: string;
  yogam: string;
  karanam: string;
  rahuKalam: string;
  yamagandam: string;
  sunrise: string;
  sunset: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export interface Booking {
  id: string;
  name: string;
  date: string;
  type: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  amount: number;
  phone?: string;
  tickets?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  attachmentUrl?: string;
}

export interface TempleEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  type: 'Festival' | 'Pooja' | 'Ceremony';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface LibraryItem {
  id: string;
  title: string;
  type: 'audio' | 'ebook';
  url: string;
  description: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  message: string;
  date: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  category: string;
  date: string;
  transactionId: string;
  gothram?: string;
  pan?: string;
}

export interface TempleInsights {
  ladduStock: number;
  laddusDistributed: number;
  darshanWaitTime: number;
  crowdStatus: 'Low' | 'Moderate' | 'High';
}

// --- ERP Interfaces ---
export interface InventoryItem {
  id: string;
  name: string;
  category: 'Prasad' | 'Merchandise' | 'Pooja Items';
  stock: number;
  unit: string;
  lowStockThreshold: number;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'Room' | 'Hall';
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  pricePerDay: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Priest' | 'Staff' | 'Devotee';
  phone: string;
  lastActive: string;
  donations?: Donation[];
  bookings?: Booking[];
}

// --- Translation Types ---
export type Language = 'EN' | 'TE' | 'HI' | 'SA'; // English, Telugu, Hindi, Sanskrit

@Injectable({
  providedIn: 'root'
})
export class TempleService {
  private supabaseUrl = 'https://opwncdejpaeltylplvhk.supabase.co';
  private supabaseKey = 'sb_publishable_u3wGO_9f3tfT2CaldVuDFw_vlXLDymg';
  public supabase: SupabaseClient;

  // --- State Signals ---
  
  // Localization
  currentLang = signal<Language>('EN');
  
  translations: Record<string, Record<Language, string>> = {
    'home': { EN: 'Home', TE: 'ముఖపేజీ', HI: 'मुख्य पृष्ठ', SA: 'गृहम्' },
    'history': { EN: 'History', TE: 'చరిత్ర', HI: 'इतिहास', SA: 'इतिहासः' },
    'darshan': { EN: '3D Darshan', TE: '3D దర్శనం', HI: '3D दर्शन', SA: 'दर्शनम्' },
    'booking': { EN: 'Booking', TE: 'బుకింగ్', HI: 'बुकिंग', SA: 'आरक्षणम्' },
    'hundi': { EN: 'E-Hundi', TE: 'ఈ-హుండీ', HI: 'ई-हुंडी', SA: 'हुण्डी' },
    'library': { EN: 'Library', TE: 'గ్రంథాలయం', HI: 'पुस्तकालय', SA: 'ग्रन्थालयः' },
    'gallery': { EN: 'Gallery', TE: 'చిత్రమాలిక', HI: 'दीर्घा', SA: 'चित्रशाला' },
    'login': { EN: 'Devotee Login', TE: 'భక్తుల ప్రవేశం', HI: 'भक्त लॉगिन', SA: 'भक्त प्रवेशः' },
    'admin': { EN: 'Admin', TE: 'నిర్వాహకుడు', HI: 'प्रशासक', SA: 'प्रशासकः' },
    'book_darshan': { EN: 'Book Darshan', TE: 'దర్శనం బుక్ చేయండి', HI: 'दर्शन बुक करें', SA: 'दर्शनं कुरु' },
    'donate_now': { EN: 'Donate Now', TE: 'విరాళం ఇవ్వండి', HI: 'दान करें', SA: 'दानं कुरु' },
    'temple_name': { EN: 'Uttarandhra Tirumala', TE: 'ఉత్తరాంధ్ర తిరుమల', HI: 'उत्तरांध्र तिरुमला', SA: 'उत्तरांध्र तिरुमला' },
  };

  // Config
  siteConfig = signal<SiteConfig>({
    templeName: 'Uttarandhra Tirumala',
    subTitle: 'Shri Venkateswara Swamy Temple, Pendurthi',
    logoUrl: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/images/logo/cb3d423f-ec99-48a4-b070-adf5c21ddd76.png',
    liveLink: 'https://www.youtube.com/@ramanujampendurthi1012',
    contactPhone: '+91 99999 99999',
    contactEmail: 'helpdesk@uttarandhratirupati.org',
    address: 'UTTHARANDHRA TIRUPATI, Balaji Nagar, Pendurthi, Visakhapatnam, Andhra Pradesh 531173',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d237.41112734036318!2d83.21121301276729!3d17.811517714706405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39671fbc497e33%3A0xfb3d22187ebdc15!2sUTTHARANDHRA%20TIRUPATI%20(%20Venkateswara%20Swamy%20Temple%20)!5e0!3m2!1sen!2sin!4v1768306031383!5m2!1sen!2sin',
    whatsappChannel: 'https://whatsapp.com/channel/0029Vap96ByFnSzG0KocMq1y',
    historyContent: `The Lord of the Universe and Vaikuntha, Srimannarayana, takes many forms to protect his devotees. In this Kaliyuga, he incarnated as Lord Venkateswara to offer solace to mankind.`,
    historyImageUrl: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_ujj4zlujj4zlujj4.png',
    bankInfo: {
      accountName: 'Uttarandhra Tirupati Devasthanam Trust',
      accountNumber: '123456789012',
      bankName: 'Union Bank of India',
      ifsc: 'UBIN0532101',
      branch: 'Pendurthi',
      qrCodeUrl: 'https://picsum.photos/id/20/200/200'
    },
    timings: {
      suprabhatam: '05:00 AM',
      morningDarshan: '06:00 AM - 01:00 PM',
      breakTime: '01:00 PM - 04:00 PM',
      eveningDarshan: '04:00 PM - 08:30 PM',
      ekanthaSeva: '09:00 PM'
    },
    enableBooking: true,
    enableHundi: true,
    maintenanceMode: false,
    theme: {
      primaryColor: '#800000', // Maroon
      secondaryColor: '#d97706', // Amber-600
      accentColor: '#fbbf24', // Amber-400
      backgroundColor: '#fffbeb' // Amber-50
    },
    donationAmounts: [116, 216, 516, 1116, 2116, 5116],
    donationCategories: ['General Hundi', 'Annadanam', 'Gosala', 'Vidyadanam', 'Temple Construction'],
    seo: {
      metaTitle: 'Uttarandhra Tirumala - Official Temple Website',
      metaDescription: 'Official website of Uttarandhra Tirupati, Pendurthi. Book Darshan, Sevas, and make E-Hundi donations online.',
      keywords: 'tirupati, pendurthi, temple, darshan, balaji, venkateswara'
    },
    socialLinks: {
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com'
    }
  });

  availableSevas = signal<SevaType[]>([
    { id: 'seva1', name: 'Special Entry Darshan', price: 300, description: 'Quick line access to Sanctum' },
    { id: 'seva2', name: 'Sahasranama Archana', price: 500, description: 'Chanting 1000 names with Tulasi' },
    { id: 'seva3', name: 'Visesha Abhishekam', price: 1500, description: 'Friday Special Holy Bath' }
  ]);

  dailyPanchangam = signal<Panchangam>({
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    tithi: 'Shukla Ekadashi',
    nakshatra: 'Shravana',
    yogam: 'Siddha',
    karanam: 'Bava',
    rahuKalam: '10:30 AM - 12:00 PM',
    yamagandam: '03:00 PM - 04:30 PM',
    sunrise: '06:05 AM',
    sunset: '06:12 PM'
  });

  events = signal<TempleEvent[]>([
    { id: 'evt1', title: 'Vaikuntha Ekadashi', startDate: '2024-12-23', endDate: '2024-12-24', description: 'Uttara Dwara Darshanam', type: 'Festival', status: 'Upcoming' },
    { id: 'evt2', title: 'Brahmotsavam', startDate: '2024-10-10', endDate: '2024-10-19', description: 'Annual Grand Festival', type: 'Festival', status: 'Upcoming' }
  ]);

  insights = signal<TempleInsights>({
    ladduStock: 5000,
    laddusDistributed: 1240,
    darshanWaitTime: 15,
    crowdStatus: 'Moderate'
  });

  weather = signal<{temp: number, condition: string}>({ temp: 28, condition: 'Sunny' });

  flashNews = signal<string>("Om Namo Venkatesaya! Annual Brahmotsavams start from next week. Dhanurmasam Tiruppavai recitation daily at 5 AM.");

  gallery = signal<GalleryItem[]>([
    { id: 'img14', type: 'image', url: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/gallery/img%2014.jpg', caption: 'Temple Gopuram' },
    { id: 'img17', type: 'image', url: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/gallery/img%2017.jpg', caption: 'Utsava Murthy' },
    { id: 'img2', type: 'image', url: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/gallery/img%202.jpg', caption: 'Alankaram' },
    { id: 'img3', type: 'image', url: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/gallery/img%203.jpg', caption: 'Garuda Seva' }
  ]);

  news = signal<NewsItem[]>([
    {
       id: '1', title: 'Brahmotsavam Schedule Released', date: new Date().toISOString(), 
       content: 'The detailed schedule for the annual Brahmotsavams has been released. Devotees are requested to participate.',
       imageUrl: 'https://opwncdejpaeltylplvhk.supabase.co/storage/v1/object/public/gallery/img%205.jpg'
    }
  ]);

  library = signal<LibraryItem[]>([
    { id: 'lib1', type: 'audio', title: 'Suprabhatam', url: 'https://www.tirumala.org/music/suprabhatam.mp3', description: 'Early morning awakening hymn.' },
    { id: 'lib2', type: 'audio', title: 'Vishnu Sahasranamam', url: 'https://www.tirumala.org/music/vishnu_sahasranamam.mp3', description: 'Chanting of 1000 names of Lord Vishnu.' },
    { id: 'lib3', type: 'ebook', title: 'Temple History Book', url: '#', description: 'Detailed history of Uttarandhra Tirupati (PDF).' }
  ]);

  feedbacks = signal<FeedbackItem[]>([]);
  donations = signal<Donation[]>([
    { id: 'd1', donorName: 'Ramesh Gupta', amount: 1116, category: 'Annadanam', date: new Date().toISOString(), transactionId: 'TXN88392' },
    { id: 'd2', donorName: 'Suresh Kumar', amount: 516, category: 'General Hundi', date: new Date().toISOString(), transactionId: 'TXN11223' }
  ]);
  bookings = signal<Booking[]>([]);

  inventory = signal<InventoryItem[]>([
    { id: '1', name: 'Tirupati Laddu (Big)', category: 'Prasad', stock: 4500, unit: 'Pieces', lowStockThreshold: 500 },
    { id: '2', name: 'Pulihora', category: 'Prasad', stock: 200, unit: 'Kg', lowStockThreshold: 50 }
  ]);

  accommodationList = signal<Accommodation[]>([
    { id: '1', name: 'Kalyana Mandapam', type: 'Hall', capacity: 500, status: 'Available', pricePerDay: 25000 },
    { id: '2', name: 'Guest House A (AC)', type: 'Room', capacity: 4, status: 'Occupied', pricePerDay: 1500 }
  ]);

  // Devotee Authentication State
  currentUser = signal<UserProfile | null>(null);

  // Admin Authentication State
  private _isAdminAuthenticated = signal<boolean>(false);

  users = signal<UserProfile[]>([
    { id: '1', name: 'Admin User', email: 'admin@uttarandhra.org', role: 'Super Admin', phone: '9999999999', lastActive: new Date().toISOString() }
  ]);
  
  // 3D Darshan State
  festivalMode = signal<boolean>(false);
  
  // Computed
  queueWaitTime = computed(() => this.insights().darshanWaitTime);
  crowdLevel = computed(() => this.insights().crowdStatus);
  totalDonations = computed(() => this.donations().reduce((sum, d) => sum + d.amount, 0));
  lowStockItems = computed(() => this.inventory().filter(i => i.stock <= i.lowStockThreshold));

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    interval(30000).subscribe(() => this.simulateUpdates());
    this.applyTheme(this.siteConfig().theme);
  }

  // --- Translation Methods ---
  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
  
  translate(key: string): string {
    const lang = this.currentLang();
    return this.translations[key]?.[lang] || this.translations[key]?.['EN'] || key;
  }

  // --- Actions ---

  setFestivalMode(isFestival: boolean) {
    this.festivalMode.set(isFestival);
  }

  private simulateUpdates() {
     const current = this.insights().darshanWaitTime;
     const change = Math.floor(Math.random() * 5) - 2;
     const newTime = Math.max(5, current + change);
     
     this.insights.update(i => ({
         ...i, 
         darshanWaitTime: newTime,
         crowdStatus: newTime > 30 ? 'High' : (newTime > 15 ? 'Moderate' : 'Low'),
         ladduStock: Math.max(0, i.ladduStock - Math.floor(Math.random() * 5)),
         laddusDistributed: i.laddusDistributed + Math.floor(Math.random() * 5)
     }));
     this.updateInventory('1', this.insights().ladduStock);
  }

  // Devotee Auth (Mock)
  loginDevotee(phone: string) {
     // Mock Login
     const user: UserProfile = {
        id: 'dev1',
        name: 'Srinivas Rao',
        email: 'srinivas@example.com',
        phone: phone,
        role: 'Devotee',
        lastActive: new Date().toISOString(),
        bookings: [
            { id: 'b1', name: 'Srinivas Rao', date: '2024-03-10', type: 'Special Darshan', status: 'Completed', amount: 300 }
        ],
        donations: [
            { id: 'd10', donorName: 'Srinivas Rao', amount: 1116, category: 'Annadanam', date: '2024-02-15', transactionId: 'TXN0011' }
        ]
     };
     this.currentUser.set(user);
     return true;
  }

  logout() {
      this.currentUser.set(null);
  }

  updateSiteConfig(config: SiteConfig) { 
    this.siteConfig.set(config);
    this.applyTheme(config.theme);
  }

  applyTheme(theme: ThemeConfig) {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', theme.primaryColor);
      root.style.setProperty('--secondary-color', theme.secondaryColor);
      root.style.setProperty('--accent-color', theme.accentColor);
      root.style.setProperty('--bg-color', theme.backgroundColor);
    }
  }

  updateSevaPrice(id: string, price: number, name?: string) {
    this.availableSevas.update(sevas => 
      sevas.map(s => s.id === id ? { ...s, price, name: name || s.name } : s)
    );
  }

  addSeva(seva: Omit<SevaType, 'id'>) {
    this.availableSevas.update(sevas => [...sevas, { ...seva, id: Date.now().toString() }]);
  }

  deleteSeva(id: string) {
    this.availableSevas.update(sevas => sevas.filter(s => s.id !== id));
  }

  updatePanchangam(data: Panchangam) { this.dailyPanchangam.set(data); }
  updateFlashNews(text: string) { this.flashNews.set(text); }
  updateInsights(data: TempleInsights) { this.insights.set(data); }

  addMediaItem(url: string, caption: string, type: 'image' | 'video') {
     const newItem: GalleryItem = { id: Date.now().toString(), type, url, caption };
     this.gallery.update(g => [newItem, ...g]);
  }
  deletePhoto(id: string) { this.gallery.update(g => g.filter(i => i.id !== id)); }

  addNews(title: string, content: string, attachmentUrl?: string, imageUrl?: string) {
     const item: NewsItem = { id: Date.now().toString(), title, content, date: new Date().toISOString(), attachmentUrl, imageUrl };
     this.news.update(n => [item, ...n]);
  }
  deleteNews(id: string) { this.news.update(n => n.filter(i => i.id !== id)); }

  addEvent(event: Omit<TempleEvent, 'id'>) {
    this.events.update(e => [...e, { ...event, id: Date.now().toString() }]);
  }
  deleteEvent(id: string) {
    this.events.update(e => e.filter(i => i.id !== id));
  }

  addLibraryItem(item: Omit<LibraryItem, 'id'>) {
     this.library.update(l => [{...item, id: Date.now().toString()}, ...l]);
  }
  deleteLibraryItem(id: string) { this.library.update(l => l.filter(i => i.id !== id)); }

  addFeedback(name: string, message: string) {
     this.feedbacks.update(f => [{ id: Date.now().toString(), name, message, date: new Date().toISOString() }, ...f]);
  }
  deleteFeedback(id: string) { this.feedbacks.update(f => f.filter(i => i.id !== id)); }

  addBooking(booking: Omit<Booking, 'id' | 'status'>) {
    const newBooking: Booking = { ...booking, id: Math.random().toString(36).substr(2, 9), status: 'Confirmed' };
    this.bookings.update(list => [newBooking, ...list]);
    
    // If logged in, add to user profile (Mock)
    if(this.currentUser()) {
        this.currentUser.update(u => {
            if(!u) return null;
            return { ...u, bookings: [newBooking, ...(u.bookings || [])] };
        });
    }
  }

  updateBookingStatus(id: string, status: Booking['status']) {
    this.bookings.update(list => list.map(b => b.id === id ? { ...b, status } : b));
  }
  
  cancelBooking(id: string) {
    this.updateBookingStatus(id, 'Cancelled');
  }

  addDonation(donation: Donation) {
    this.donations.update(list => [donation, ...list]);
     // If logged in, add to user profile (Mock)
    if(this.currentUser()) {
        this.currentUser.update(u => {
            if(!u) return null;
            return { ...u, donations: [donation, ...(u.donations || [])] };
        });
    }
  }

  updateInventory(id: string, newStock: number) {
    this.inventory.update(items => items.map(i => i.id === id ? { ...i, stock: newStock } : i));
  }
  
  addInventoryItem(item: Omit<InventoryItem, 'id'>) {
    this.inventory.update(items => [...items, { ...item, id: Date.now().toString() }]);
  }

  updateRoomStatus(id: string, status: Accommodation['status']) {
    this.accommodationList.update(list => list.map(r => r.id === id ? { ...r, status } : r));
  }

  addUser(user: Omit<UserProfile, 'id' | 'lastActive'>) {
    this.users.update(u => [...u, { ...user, id: Date.now().toString(), lastActive: 'Never' }]);
  }

  updateUserRole(id: string, role: UserProfile['role']) {
    this.users.update(list => list.map(u => u.id === id ? { ...u, role } : u));
  }

  updateUserProfile(id: string, data: Partial<UserProfile>) {
    this.users.update(list => list.map(u => u.id === id ? { ...u, ...data } : u));
  }

  deleteUser(id: string) {
    this.users.update(u => u.filter(user => user.id !== id));
  }

  async verifyPayment(txnId: string, amount: number, category: string): Promise<{success: boolean, message: string}> {
      return new Promise(resolve => setTimeout(() => resolve({success: true, message: 'Verified'}), 1500));
  }

  // --- Admin Auth ---
  loginAdmin(password: string): boolean {
    // Simple mock check
    if(password === 'admin123' || password === 'omnamovenkatesaya') {
      this._isAdminAuthenticated.set(true);
      return true;
    }
    return false;
  }

  isAdmin(): boolean {
     return this._isAdminAuthenticated(); 
  }
}