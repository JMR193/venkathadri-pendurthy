import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TempleService } from '../../core/services/temple.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-stone-50 overflow-x-hidden">
      
      <!-- Parallax Hero Section -->
      <section class="relative h-[90vh] flex items-center justify-center overflow-hidden bg-[#2a0a0a]">
        <!-- Background Layer -->
        <div class="absolute inset-0 opacity-60 bg-[url('https://akcwdjwyhsnaxmtnjuqa.supabase.co/storage/v1/object/public/images/channels4_banner.jpg')] bg-cover bg-fixed bg-center scale-105 animate-pan-slow"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent"></div>
        
        <!-- Content -->
        <div class="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <div class="animate-fade-in-up">
            <img [src]="templeService.siteConfig().logoUrl" class="w-32 h-32 mx-auto mb-8 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-pulse-slow">
            
            <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 mb-6 drop-shadow-xl tracking-tight leading-tight">
              {{ templeService.siteConfig().templeName }}
            </h1>
            
            <div class="flex items-center justify-center gap-4 mb-10 opacity-90">
                <div class="h-[2px] w-12 bg-amber-500"></div>
                <p class="text-xl md:text-3xl text-amber-100 font-serif italic tracking-widest uppercase">
                  {{ templeService.siteConfig().subTitle }}
                </p>
                <div class="h-[2px] w-12 bg-amber-500"></div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-6 justify-center">
              <a routerLink="/darshan" class="group relative theme-bg-primary text-white px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-2xl border border-red-800 flex items-center justify-center gap-3 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="material-icons relative z-10">view_in_ar</span>
                <span class="relative z-10">3D Digital Darshan</span>
              </a>
              <a routerLink="/booking" class="group bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105 hover:bg-white/20 flex items-center justify-center gap-3">
                <span class="material-icons">calendar_month</span>
                Book Seva
              </a>
            </div>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-stone-400">
           <span class="material-icons text-3xl">keyboard_arrow_down</span>
        </div>
      </section>

      <!-- Live Heads-Up Display (HUD) -->
      <section class="relative z-20 -mt-20 px-4 pb-20">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <!-- Panchangam Widget -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-amber-500 hover:-translate-y-2 transition-transform duration-300">
            <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="material-icons text-amber-500 text-sm">wb_sunny</span> Today's Panchangam
            </h3>
            <div class="space-y-3">
              <div>
                 <p class="text-3xl font-serif font-bold text-stone-800 leading-none">{{ getDay(templeService.dailyPanchangam().date) }}</p>
                 <p class="text-sm text-stone-500 uppercase font-bold">{{ getMonth(templeService.dailyPanchangam().date) }}</p>
              </div>
              <div class="h-px bg-stone-100 w-full"></div>
              <div class="text-sm text-stone-600">
                <div class="flex justify-between py-1"><span>Tithi</span> <strong class="text-stone-800">{{ templeService.dailyPanchangam().tithi }}</strong></div>
                <div class="flex justify-between py-1"><span>Nakshatra</span> <strong class="text-stone-800">{{ templeService.dailyPanchangam().nakshatra }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Live Queue Widget -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-green-500 hover:-translate-y-2 transition-transform duration-300">
             <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="material-icons text-green-500 text-sm">hourglass_top</span> Darshan Wait Time
            </h3>
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-5xl font-bold text-stone-900 tracking-tighter">{{ templeService.queueWaitTime() }}</span>
              <span class="text-stone-500 font-medium">min</span>
            </div>
             <div class="w-full bg-stone-100 rounded-full h-2 mb-3 overflow-hidden">
              <div class="bg-green-500 h-full rounded-full transition-all duration-1000" [style.width]="(templeService.queueWaitTime() / 60) * 100 + '%'"></div>
            </div>
             <p class="text-xs text-stone-500 bg-stone-50 py-1 px-2 rounded inline-block">Crowd: <strong class="text-green-600 uppercase">{{ templeService.crowdLevel() }}</strong></p>
          </div>

          <!-- Prasadam Widget -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-orange-500 hover:-translate-y-2 transition-transform duration-300">
             <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="material-icons text-orange-500 text-sm">cookie</span> Prasadam Status
            </h3>
            <div class="flex justify-between items-end mb-2">
               <div>
                  <p class="text-3xl font-bold text-stone-800">{{ templeService.insights().laddusDistributed | number }}</p>
                  <p class="text-xs text-stone-500">Distributed Today</p>
               </div>
               <div class="text-right">
                  <p class="text-lg font-bold text-orange-600">{{ templeService.insights().ladduStock | number }}</p>
                  <p class="text-xs text-stone-500">Available</p>
               </div>
            </div>
            <button class="w-full mt-4 text-xs font-bold text-orange-600 border border-orange-200 bg-orange-50 py-2 rounded hover:bg-orange-100 transition-colors uppercase tracking-wide">Pre-order Prasadam</button>
          </div>

          <!-- Quick Action: Hundi -->
           @if (templeService.siteConfig().enableHundi) {
             <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group cursor-pointer" routerLink="/e-hundi">
               <div class="absolute -right-4 -top-4 text-white/20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                 <span class="material-icons text-9xl">savings</span>
               </div>
               <div class="relative z-10 h-full flex flex-col justify-between">
                  <div>
                     <h3 class="text-lg font-serif font-bold mb-1">Srivari Hundi</h3>
                     <p class="text-amber-100 text-xs opacity-90">Offer your Kanuka online securely.</p>
                  </div>
                  <div class="flex items-center gap-2 font-bold text-sm bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm mt-4 group-hover:bg-white/30 transition-colors">
                     Donate Now <span class="material-icons text-sm">arrow_forward</span>
                  </div>
               </div>
            </div>
           }

        </div>
      </section>

      <!-- History Teaser Section -->
      <section class="py-12 bg-white text-center relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
        <div class="max-w-4xl mx-auto px-4 relative z-10">
          <div class="inline-block p-2 px-4 rounded-full bg-stone-100 text-stone-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Sthala Purana</div>
          <h2 class="text-4xl md:text-5xl font-serif font-bold theme-text-primary mb-6 leading-tight">A Legacy of Devotion</h2>
          <p class="text-stone-600 mb-10 text-lg leading-relaxed max-w-2xl mx-auto font-light">Discover the sacred legend of the 'Divine Step' and the prophecy of Sri Chinna Jeeyar Swamy that established this holy Kshetram as the "Uttarandhra Tirupati".</p>
          <a routerLink="/history" class="inline-flex items-center gap-2 text-white bg-[#2a0a0a] px-8 py-3 rounded-full font-bold hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl">
            Explore History <span class="material-icons text-sm">arrow_forward</span>
          </a>
        </div>
      </section>
      
      <!-- Latest Announcements -->
      @if (templeService.news().length > 0) {
        <section class="py-16 bg-white border-b border-stone-100">
            <div class="max-w-7xl mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-serif font-bold text-stone-800">Temple Announcements</h2>
                    <div class="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    @for (item of templeService.news(); track item.id) {
                      <div class="bg-stone-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-stone-100 flex flex-col group">
                          @if (item.imageUrl) {
                            <div class="h-48 overflow-hidden relative">
                                <img [src]="item.imageUrl" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                                <div class="absolute bottom-0 left-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-tr-lg uppercase tracking-wider">
                                  News
                                </div>
                            </div>
                          }
                          <div class="p-6 flex-grow flex flex-col">
                              <div class="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                                  <span class="material-icons text-sm">event</span> {{ item.date | date:'mediumDate' }}
                              </div>
                              <h3 class="text-xl font-bold text-stone-800 mb-3 group-hover:text-amber-700 transition-colors">{{ item.title }}</h3>
                              <p class="text-stone-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">{{ item.content }}</p>
                              @if (item.attachmentUrl) {
                                <div class="mt-auto pt-4 border-t border-stone-200">
                                    <a [href]="item.attachmentUrl" target="_blank" class="text-amber-700 font-bold text-sm flex items-center gap-1 hover:underline">
                                        <span class="material-icons text-sm">attachment</span> Download Attachment
                                    </a>
                                </div>
                              }
                          </div>
                      </div>
                    }
                </div>
            </div>
        </section>
      }

      <!-- Featured Services (Grid) -->
      <section class="py-20 px-4 bg-stone-100">
         <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
               <h2 class="text-3xl font-serif font-bold text-stone-800">Pilgrim Services</h2>
               <div class="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
               <!-- Card 1 -->
               <div class="group bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-amber-500">
                  <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                     <span class="material-icons text-3xl">library_music</span>
                  </div>
                  <h3 class="text-xl font-bold text-stone-800 mb-3">Spiritual Library</h3>
                  <p class="text-stone-600 text-sm leading-relaxed mb-6">Access a vast collection of Pravachanams, Suprabhatam audio, and sacred e-books.</p>
                  <a routerLink="/library" class="text-amber-700 font-bold text-sm uppercase tracking-wide hover:underline">Browse Library</a>
               </div>

               <!-- Card 2 -->
               <div class="group bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-amber-500">
                  <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                     <span class="material-icons text-3xl">collections</span>
                  </div>
                  <h3 class="text-xl font-bold text-stone-800 mb-3">Divine Gallery</h3>
                  <p class="text-stone-600 text-sm leading-relaxed mb-6">Experience the divinity through high-quality images and videos of temple events.</p>
                  <a routerLink="/gallery" class="text-amber-700 font-bold text-sm uppercase tracking-wide hover:underline">View Photos</a>
               </div>

               <!-- Card 3 -->
               <div class="group bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-amber-500">
                  <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                     <span class="material-icons text-3xl">feedback</span>
                  </div>
                  <h3 class="text-xl font-bold text-stone-800 mb-3">Devotee Feedback</h3>
                  <p class="text-stone-600 text-sm leading-relaxed mb-6">Your suggestions help us improve the amenities and services for all pilgrims.</p>
                  <a routerLink="/feedback" class="text-amber-700 font-bold text-sm uppercase tracking-wide hover:underline">Share Feedback</a>
               </div>
            </div>
         </div>
      </section>

      <!-- Location Map -->
      <section class="h-[500px] w-full bg-stone-200 relative">
        <iframe 
          [src]="sanitizedMapUrl" 
          width="100%" 
          height="100%" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"
          class="grayscale hover:grayscale-0 transition-all duration-1000">
        </iframe>
        <div class="absolute bottom-8 left-8 bg-white p-6 rounded-xl shadow-2xl max-w-sm border-l-4 border-amber-500">
          <h4 class="font-bold text-stone-900 text-lg mb-2">Visit the Temple</h4>
          <p class="text-sm text-stone-600 leading-relaxed">{{ templeService.siteConfig().address }}</p>
          <a [href]="'https://www.google.com/maps/dir/?api=1&destination=' + templeService.siteConfig().address" target="_blank" class="mt-4 inline-block text-amber-700 font-bold text-xs uppercase tracking-wide hover:underline">Get Directions</a>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .animate-pan-slow { animation: pan 30s linear infinite alternate; }
    @keyframes pan { 0% { transform: scale(1.05) translate(0,0); } 100% { transform: scale(1.15) translate(-20px, -10px); } }
  `]
})
export class HomeComponent {
  templeService = inject(TempleService);
  sanitizer = inject(DomSanitizer);
  sanitizedMapUrl: SafeResourceUrl;

  constructor() {
    this.sanitizedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.templeService.siteConfig().mapEmbedUrl);
  }

  getDay(dateStr: string): string {
    const parts = dateStr.split(/[\s,]+/);
    // Finds the first numeric part in the date string (e.g. "20" from "May 20, 2024")
    const day = parts.find(p => !isNaN(Number(p)) && Number(p) <= 31);
    return day || '01';
  }

  getMonth(dateStr: string): string { 
     const parts = dateStr.split(/[\s,]+/);
     // Simple check for common month names or return default
     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
     const month = parts.find(p => monthNames.some(m => m.toLowerCase().includes(p.toLowerCase())));
     return month || 'Today'; 
  }
}