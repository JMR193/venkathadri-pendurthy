
import { Injectable, signal, computed, inject } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

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
  historyContent: string;
  historyImageUrl: string;
  aboutUsContent?: string;
  contactUsContent?: string;
  bankInfo: BankInfo;
  timings: Timings;
  enableBooking: boolean;
  enableHundi: boolean;
  maintenanceMode: boolean;
  theme: ThemeConfig;
  donationAmounts: number[];
  donationCategories: string[];
  seo: SeoConfig;
  socialLinks: { 
    facebook?: string; 
    instagram?: string; 
    twitter?: string; 
    youtube?: string; 
    whatsapp?: string; 
  };
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
  userId?: string;
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
  userId?: string;
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
  password?: string; // Only for UI binding in profile forms, not stored in "users" table
  lastActive: string;
  donations?: Donation[];
  bookings?: Booking[];
}

// --- Translation Types ---
export type Language = 'EN' | 'TE' | 'HI' | 'SA'; 

@Injectable({
  providedIn: 'root'
})
export class TempleService {
  private supabaseUrl = 'https://akcwdjwyhsnaxmtnjuqa.supabase.co';
  private supabaseKey = 'sb_publishable_oG9CQKt4xAiDpgRXAbuGjg_iwk21dsx';
  public supabase: SupabaseClient;

  // --- State Signals ---
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

  // Config - Default State before loading from DB
  siteConfig = signal<SiteConfig>({
    templeName: 'Uttarandhra Tirumala',
    subTitle: 'Shri Venkateswara Swamy Temple, Pendurthi',
    logoUrl: 'https://akcwdjwyhsnaxmtnjuqa.supabase.co/storage/v1/object/public/images/logo/cb3d423f-ec99-48a4-b070-adf5c21ddd76.png',
    liveLink: 'https://www.youtube.com/@ramanujampendurthi1012',
    contactPhone: '+91 99999 99999',
    contactEmail: 'helpdesk@uttarandhratirupati.org',
    address: 'UTTHARANDHRA TIRUPATI, Balaji Nagar, Pendurthi, Visakhapatnam, Andhra Pradesh 531173',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d237.41112734036318!2d83.21121301276729!3d17.811517714706405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39671fbc497e33%3A0xfb3d22187ebdc15!2sUTTHARANDHRA%20TIRUPATI%20(%20Venkateswara%20Swamy%20Temple%20)!5e0!3m2!1sen!2sin!4v1768306031383!5m2!1sen!2sin',
    historyContent: `The Lord of the Universe...`,
    historyImageUrl: 'https://picsum.photos/id/10/800/600',
    aboutUsContent: '<p>Welcome to Uttarandhra Tirumala...</p>',
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
      primaryColor: '#800000', 
      secondaryColor: '#d97706',
      accentColor: '#fbbf24',
      backgroundColor: '#fffbeb'
    },
    donationAmounts: [116, 216, 516, 1116],
    donationCategories: ['General Hundi', 'Annadanam'],
    seo: {
      metaTitle: 'Uttarandhra Tirumala',
      metaDescription: 'Official Temple Website',
      keywords: 'temple'
    },
    socialLinks: {}
  });

  availableSevas = signal<SevaType[]>([]);
  
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

  events = signal<TempleEvent[]>([]);
  
  insights = signal<TempleInsights>({
    ladduStock: 5000,
    laddusDistributed: 1240,
    darshanWaitTime: 15,
    crowdStatus: 'Moderate'
  });

  weather = signal<{temp: number, condition: string}>({ temp: 28, condition: 'Sunny' });
  flashNews = signal<string>("Om Namo Venkatesaya! Welcome to the digital abode.");
  
  gallery = signal<GalleryItem[]>([]);
  news = signal<NewsItem[]>([]);
  library = signal<LibraryItem[]>([]);
  feedbacks = signal<FeedbackItem[]>([]);
  donations = signal<Donation[]>([]);
  bookings = signal<Booking[]>([]);
  inventory = signal<InventoryItem[]>([]);
  accommodationList = signal<Accommodation[]>([]);
  
  // User Management Signals
  users = signal<UserProfile[]>([]);
  currentUser = signal<UserProfile | null>(null);
  
  // 3D Darshan State
  festivalMode = signal<boolean>(false);
  
  // Computed
  queueWaitTime = computed(() => this.insights().darshanWaitTime);
  crowdLevel = computed(() => this.insights().crowdStatus);
  totalDonations = computed(() => this.donations().reduce((sum, d) => sum + d.amount, 0));
  lowStockItems = computed(() => this.inventory().filter(i => i.stock <= i.lowStockThreshold));

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    // Initial Load
    this.loadAllData();
    this.setupRealtimeSubscriptions();
    this.checkSession();

    // Background updates for insights simulation/sync
    interval(60000).subscribe(() => this.refreshLiveData());
  }

  // --- Core Loading Logic ---

  async loadAllData() {
    // 1. Site Config
    const { data: configData } = await this.supabase.from('system_settings').select('value').eq('key', 'site_config').single();
    if (configData?.value) {
      this.siteConfig.set(configData.value);
      this.applyTheme(configData.value.theme);
    }

    // 2. Collections
    const { data: sevas } = await this.supabase.from('sevas').select('*');
    if (sevas) this.availableSevas.set(sevas);

    const { data: events } = await this.supabase.from('events').select('*').order('startDate');
    if (events) this.events.set(events);

    const { data: news } = await this.supabase.from('news').select('*').order('date', { ascending: false });
    if (news) this.news.set(news);

    const { data: gallery } = await this.supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (gallery) this.gallery.set(gallery);

    const { data: library } = await this.supabase.from('library').select('*');
    if (library) this.library.set(library);

    const { data: feedbacks } = await this.supabase.from('feedbacks').select('*').order('date', { ascending: false }).limit(50);
    if (feedbacks) this.feedbacks.set(feedbacks);

    const { data: rooms } = await this.supabase.from('accommodation').select('*');
    if (rooms) this.accommodationList.set(rooms);

    const { data: inv } = await this.supabase.from('inventory').select('*');
    if (inv) this.inventory.set(inv);

    // Secure Data (Bookings/Donations/Users) - RLS will handle visibility
    const { data: bookings } = await this.supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (bookings) this.bookings.set(bookings);

    const { data: donations } = await this.supabase.from('donations').select('*').order('date', { ascending: false });
    if (donations) this.donations.set(donations);
    
    // Only admins will get results here due to RLS, or current user
    const { data: users } = await this.supabase.from('users').select('*');
    if (users) this.users.set(users);
  }

  setupRealtimeSubscriptions() {
    // Subscribe to public changes to keep UI live
    this.supabase.channel('public_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
          this.handleRealtimeChange(payload, this.bookings);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
          this.handleRealtimeChange(payload, this.inventory);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, (payload) => {
          this.handleRealtimeChange(payload, this.news);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, (payload: any) => {
         if(payload.new && payload.new.key === 'site_config') {
             this.siteConfig.set(payload.new.value);
             this.applyTheme(payload.new.value.theme);
         }
      })
      .subscribe();
  }

  private handleRealtimeChange(payload: any, signalUpdater: any) {
      if (payload.eventType === 'INSERT') {
          signalUpdater.update((prev: any[]) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
          signalUpdater.update((prev: any[]) => prev.map(i => i.id === payload.new.id ? payload.new : i));
      } else if (payload.eventType === 'DELETE') {
          signalUpdater.update((prev: any[]) => prev.filter(i => i.id !== payload.old.id));
      }
  }

  // --- Translation Methods ---
  setLanguage(lang: Language) { this.currentLang.set(lang); }
  translate(key: string): string {
    const lang = this.currentLang();
    return this.translations[key]?.[lang] || this.translations[key]?.['EN'] || key;
  }

  // --- Supabase Storage ---
  async uploadFile(file: File, bucket: string = 'images'): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `${fileName}`;
    const { data, error } = await this.supabase.storage.from(bucket).upload(filePath, file);
    if (error) { console.error('Upload Error:', error); return null; }
    const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  // --- Actions ---

  async updateSiteConfig(config: SiteConfig) {
    this.siteConfig.set(config);
    this.applyTheme(config.theme);
    await this.supabase.from('system_settings').upsert({ key: 'site_config', value: config });
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

  setFestivalMode(isFestival: boolean) { this.festivalMode.set(isFestival); }

  private refreshLiveData() {
      // Simulate crowd changes or fetch from backend if connected to IoT sensors
      // For now, we just fetch inventory to keep stock fresh
      this.supabase.from('inventory').select('*').then(({data}) => {
          if(data) this.inventory.set(data);
      });
  }

  // --- CRUD Operations ---

  async addSeva(seva: Omit<SevaType, 'id'>) {
    await this.supabase.from('sevas').insert([seva]);
  }
  async deleteSeva(id: string) {
    await this.supabase.from('sevas').delete().eq('id', id);
    this.availableSevas.update(s => s.filter(i => i.id !== id));
  }
  
  updatePanchangam(data: Panchangam) { this.dailyPanchangam.set(data); }
  updateFlashNews(text: string) { this.flashNews.set(text); }
  updateInsights(data: TempleInsights) { this.insights.set(data); }

  async addMediaItem(url: string, caption: string, type: 'image' | 'video') {
     await this.supabase.from('gallery').insert([{ type, url, caption }]);
     // Local update handled by Realtime usually, but good for immediate feedback
     const newItem: GalleryItem = { id: 'temp-'+Date.now(), type, url, caption };
     this.gallery.update(g => [newItem, ...g]);
  }
  async deletePhoto(id: string) { await this.supabase.from('gallery').delete().eq('id', id); }

  async addNews(title: string, content: string, attachmentUrl?: string, imageUrl?: string) {
     await this.supabase.from('news').insert([{ title, content, imageUrl, attachmentUrl }]);
  }
  async deleteNews(id: string) { await this.supabase.from('news').delete().eq('id', id); }

  async addEvent(event: Omit<TempleEvent, 'id'>) { await this.supabase.from('events').insert([event]); }
  async deleteEvent(id: string) { await this.supabase.from('events').delete().eq('id', id); }

  async addFeedback(name: string, message: string) {
     await this.supabase.from('feedbacks').insert([{ name, message }]);
  }

  async addBooking(booking: Omit<Booking, 'id' | 'status'>) {
    const user = this.currentUser();
    const payload = { ...booking, userId: user?.id || null };
    const { data } = await this.supabase.from('bookings').insert([payload]).select().single();
    if(data) {
        // If loaded, update UI immediately
        this.bookings.update(list => [data, ...list]);
        if(user) {
             this.currentUser.update(u => u ? ({...u, bookings: [data, ...(u.bookings || [])]}) : null);
        }
    }
  }

  async updateBookingStatus(id: string, status: Booking['status']) {
    await this.supabase.from('bookings').update({ status }).eq('id', id);
  }

  async addDonation(donation: Donation) {
    const user = this.currentUser();
    // Remove ID as DB generates it, unless we pass a temp one. 
    // Usually best to let DB generate UUID.
    const { id, ...rest } = donation; 
    const payload = { ...rest, userId: user?.id || null };

    const { data } = await this.supabase.from('donations').insert([payload]).select().single();
    if (data) {
        this.donations.update(list => [data, ...list]);
         if(user) {
             this.currentUser.update(u => u ? ({...u, donations: [data, ...(u.donations || [])]}) : null);
        }
    }
  }

  async updateInventory(id: string, newStock: number) {
    await this.supabase.from('inventory').update({ stock: newStock }).eq('id', id);
  }
  async addInventoryItem(item: Omit<InventoryItem, 'id'>) { await this.supabase.from('inventory').insert([item]); }

  async updateRoomStatus(id: string, status: Accommodation['status']) {
    await this.supabase.from('accommodation').update({ status }).eq('id', id);
  }

  // --- Auth & User Management ---

  async checkSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
       this.fetchUserProfile(session.user.id);
    }
  }

  async fetchUserProfile(userId: string) {
     const { data: profile } = await this.supabase.from('users').select('*').eq('id', userId).single();
     if (profile) {
         // Load user specific data
         const { data: bookings } = await this.supabase.from('bookings').select('*').eq('userId', userId);
         const { data: donations } = await this.supabase.from('donations').select('*').eq('userId', userId);
         
         this.currentUser.set({ ...profile, bookings: bookings || [], donations: donations || [] });
     }
  }

  async registerDevotee(name: string, email: string, phone: string, password: string): Promise<boolean> {
     const { data, error } = await this.supabase.auth.signUp({ 
         email, 
         password,
         options: { data: { name, phone } } // Meta data triggers the handle_new_user SQL function
     });
     
     if (error || !data.user) {
         console.error('Signup failed', error);
         return false;
     }
     
     // Auto login usually happens, wait for session check or set user manually
     await this.fetchUserProfile(data.user.id);
     return true;
  }

  async loginDevotee(email: string, password: string): Promise<boolean> {
     const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
     if (error || !data.user) return false;
     
     await this.fetchUserProfile(data.user.id);
     return true;
  }

  async logout() {
      await this.supabase.auth.signOut();
      this.currentUser.set(null);
  }

  // Admin Management
  async addUser(user: Partial<UserProfile>) {
      alert("To add a user, ask them to Sign Up on the portal.");
  }

  async updateUserProfile(id: string, data: Partial<UserProfile>) {
     await this.supabase.from('users').update(data).eq('id', id);
     this.users.update(list => list.map(u => u.id === id ? { ...u, ...data } : u));
  }
  
  async deleteUser(id: string) {
      await this.supabase.from('users').delete().eq('id', id);
      this.users.update(u => u.filter(user => user.id !== id));
  }

  // --- Admin Auth Check ---
  async loginAdmin(email: string, password: string): Promise<boolean> {
    const user = this.currentUser();
    if (user && (user.role === 'Admin' || user.role === 'Super Admin')) return true;

    const success = await this.loginDevotee(email, password);
    if (success) {
        const u = this.currentUser();
        return !!(u && (u.role === 'Admin' || u.role === 'Super Admin'));
    }
    return false;
  }

  isAdmin(): boolean {
     const u = this.currentUser();
     return u ? (u.role === 'Admin' || u.role === 'Super Admin') : false;
  }
}
