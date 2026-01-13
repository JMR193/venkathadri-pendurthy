import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TempleService } from './core/services/temple.service';
import { AiChatComponent } from './shared/components/ai-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, AiChatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-stone-50 font-sans selection:bg-amber-200 selection:text-amber-900">
      <!-- Background Audio Element -->
      <audio #bgMusic loop src="https://www.tirumala.org/music/slogan.mp3"></audio>

      <!-- Top Bar -->
      <div class="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-amber-100 text-xs md:text-sm py-2 px-4 flex justify-between items-center transition-all duration-700 z-50 relative border-b border-red-900/50" [class.from-black]="isMusicPlaying()">
        <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
          
          <!-- Left Side: Mantra & Music Toggle -->
          <div class="flex items-center gap-4">
            <span class="font-serif tracking-widest font-bold text-amber-400/90 hidden sm:inline drop-shadow-sm">Om Namo Venkatesaya</span>
            
            <!-- Music Toggle Button -->
            <button (click)="toggleMusic()" 
               class="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-800/50 bg-black/30 hover:bg-amber-900/50 transition-all shadow-inner group cursor-pointer backdrop-blur-sm"
               [title]="isMusicPlaying() ? 'Pause Chanting' : 'Play Background Chanting'">
               @if (isMusicPlaying()) {
                   <div class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                   </div>
                   <span class="text-[10px] font-bold text-amber-400 animate-pulse tracking-wide">CHANTING ON</span>
               } @else {
                   <span class="material-icons text-sm text-stone-400 group-hover:text-amber-200 transition-colors">volume_up</span>
                   <span class="text-[10px] font-bold text-stone-400 group-hover:text-amber-200 transition-colors tracking-wide">PLAY MANTRA</span>
               }
            </button>
          </div>

          <div class="flex gap-4 items-center opacity-90">
             <span class="hidden md:inline"><a [href]="'tel:' + templeService.siteConfig().contactPhone" class="hover:text-white transition-colors flex items-center gap-1"><span class="material-icons text-xs">call</span> <span class="font-mono">{{ templeService.siteConfig().contactPhone }}</span></a></span>
            <span class="hidden md:inline text-white/10">|</span>
            <a [href]="templeService.siteConfig().liveLink" target="_blank" class="hover:text-white transition-colors animate-pulse font-bold text-amber-400 flex items-center gap-1"><span class="material-icons text-xs">live_tv</span> Live Darshan</a>
            <span class="text-white/10">|</span>
            @if (templeService.isAdmin()) {
              <button (click)="templeService.logout()" class="font-bold text-amber-400 hover:text-amber-200 text-xs uppercase tracking-wider">Logout</button>
            } @else {
              <a routerLink="/admin" class="hover:text-white transition-colors text-xs uppercase font-bold tracking-wider flex items-center gap-1"><span class="material-icons text-xs">lock</span> Admin</a>
            }
          </div>
        </div>
      </div>

      <!-- Header / Navigation -->
      <header class="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b-4 border-amber-500 transition-all duration-300">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
          <!-- Logo Area -->
          <div class="flex items-center gap-4 cursor-pointer group" routerLink="/">
            <div class="w-12 h-12 md:w-16 md:h-16 bg-amber-50 rounded-full flex items-center justify-center border-2 border-red-900/20 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-500 group-hover:border-amber-500">
               <img [src]="templeService.siteConfig().logoUrl" alt="Logo" class="object-cover w-full h-full opacity-95" />
            </div>
            <div>
              <h1 class="text-lg md:text-2xl font-bold text-red-950 leading-tight font-serif tracking-tight group-hover:text-red-800 transition-colors">{{ templeService.siteConfig().templeName }}</h1>
              <p class="text-[10px] md:text-xs text-stone-500 font-bold tracking-[0.15em] uppercase text-amber-700">{{ templeService.siteConfig().subTitle }}</p>
            </div>
          </div>

          <!-- Desktop Nav -->
          <nav class="hidden lg:flex gap-1 items-center">
            <a routerLink="/" routerLinkActive="bg-red-50 text-red-900 font-extrabold" [routerLinkActiveOptions]="{exact: true}" class="px-3 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-red-900 transition-all">Home</a>
            <a routerLink="/history" routerLinkActive="bg-red-50 text-red-900 font-extrabold" class="px-3 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-red-900 transition-all">History</a>
            <a routerLink="/booking" routerLinkActive="bg-red-50 text-red-900 font-extrabold" class="px-3 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-red-900 transition-all flex items-center gap-1">
               <span class="material-icons text-sm">confirmation_number</span> Booking
            </a>
            <a routerLink="/e-hundi" routerLinkActive="bg-red-50 text-red-900 font-extrabold" class="px-3 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-red-900 transition-all">E-Hundi</a>
            <a routerLink="/library" routerLinkActive="bg-red-50 text-red-900 font-extrabold" class="px-3 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-red-900 transition-all">Library</a>
            <a routerLink="/gallery" routerLinkActive="bg-red-50 text-red-900 font-extrabold" class="px-3 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-red-900 transition-all">Gallery</a>
            
             <!-- Profile / CMS -->
             <div class="ml-3 pl-3 border-l border-stone-200 flex items-center gap-3">
                @if (templeService.isAdmin()) {
                  <a routerLink="/admin" routerLinkActive="bg-amber-100 text-amber-900 ring-2 ring-amber-500 ring-offset-2" class="px-3 py-1.5 rounded-md font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all uppercase tracking-wide shadow-sm">CMS Panel</a>
                }
                <a routerLink="/profile" routerLinkActive="bg-stone-800 text-white" class="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-800 hover:text-white transition-all shadow-sm group" title="Devotee Profile">
                  <span class="material-icons text-lg group-hover:scale-110 transition-transform">person</span>
                </a>
             </div>
          </nav>

          <!-- Mobile Menu Button -->
          <button class="lg:hidden text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors" (click)="toggleMobileMenu()">
            <span class="material-icons text-3xl">menu</span>
          </button>
        </div>

        <!-- Mobile Nav Drawer -->
        @if (isMobileMenuOpen()) {
          <div class="lg:hidden bg-white/95 backdrop-blur-xl border-t border-stone-100 animate-fade-in absolute w-full shadow-2xl z-50">
            <nav class="flex flex-col p-4 space-y-1">
              <a (click)="closeMobileMenu()" routerLink="/" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">home</span> Home</a>
              <a (click)="closeMobileMenu()" routerLink="/history" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">history_edu</span> History</a>
              <a (click)="closeMobileMenu()" routerLink="/booking" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">confirmation_number</span> Booking</a>
              <a (click)="closeMobileMenu()" routerLink="/e-hundi" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">currency_rupee</span> E-Hundi</a>
              <a (click)="closeMobileMenu()" routerLink="/library" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">library_music</span> Library</a>
              <a (click)="closeMobileMenu()" routerLink="/gallery" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">photo_library</span> Gallery</a>
               <a (click)="closeMobileMenu()" routerLink="/profile" class="px-4 py-3 rounded-xl font-bold text-stone-700 hover:bg-red-50 flex items-center gap-3"><span class="material-icons text-stone-400">person</span> My Profile</a>
              @if (templeService.isAdmin()) {
                 <div class="my-2 border-t border-stone-100"></div>
                 <a (click)="closeMobileMenu()" routerLink="/admin" class="px-4 py-3 mt-2 rounded-xl bg-amber-50 font-bold text-amber-800 border border-amber-100 flex items-center gap-3"><span class="material-icons text-amber-600">admin_panel_settings</span> CMS Dashboard</a>
              }
            </nav>
          </div>
        }
      </header>

      <!-- Main Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-[#1a0505] text-stone-300 py-16 border-t-8 border-red-900 relative overflow-hidden">
         <!-- Mandala Pattern Overlay -->
         <div class="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/mandala.png')] pointer-events-none mix-blend-overlay"></div>
         
         <!-- Bottom Glow -->
         <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none"></div>

         <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 mb-12">
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <div class="flex items-center gap-4 mb-6">
                <div class="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 p-2">
                   <img [src]="templeService.siteConfig().logoUrl" class="w-full h-full object-contain opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
                </div>
                <div>
                   <h3 class="text-xl font-bold text-amber-500 font-serif leading-none mb-1">{{ templeService.siteConfig().templeName }}</h3>
                   <p class="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Divine Spiritual Center</p>
                </div>
            </div>
            <p class="mb-6 text-stone-400 leading-relaxed text-sm md:border-l-2 md:border-amber-900/50 md:pl-4">{{ templeService.siteConfig().address }}</p>
             <div class="flex gap-3 justify-center md:justify-start">
                <a [href]="templeService.siteConfig().whatsappChannel" class="w-9 h-9 rounded bg-stone-800 flex items-center justify-center hover:bg-green-600 transition-colors text-white border border-stone-700" title="WhatsApp Channel"><span class="material-icons text-sm">chat</span></a>
                <a [href]="templeService.siteConfig().liveLink" class="w-9 h-9 rounded bg-stone-800 flex items-center justify-center hover:bg-red-600 transition-colors text-white border border-stone-700" title="YouTube Live"><span class="material-icons text-sm">smart_display</span></a>
             </div>
          </div>

          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 class="text-lg font-bold text-white mb-6 uppercase tracking-widest text-xs border-b border-white/10 pb-3 inline-block">Quick Links</h3>
            <ul class="space-y-3 text-sm">
              <li><a routerLink="/history" class="hover:text-amber-400 transition-colors flex items-center gap-2 justify-center md:justify-start group"><span class="material-icons text-[10px] text-stone-600 group-hover:text-amber-500 transition-colors">arrow_forward_ios</span> History & Significance</a></li>
              <li><a routerLink="/booking" class="hover:text-amber-400 transition-colors flex items-center gap-2 justify-center md:justify-start group"><span class="material-icons text-[10px] text-stone-600 group-hover:text-amber-500 transition-colors">arrow_forward_ios</span> Darshan Booking</a></li>
              <li><a routerLink="/e-hundi" class="hover:text-amber-400 transition-colors flex items-center gap-2 justify-center md:justify-start group"><span class="material-icons text-[10px] text-stone-600 group-hover:text-amber-500 transition-colors">arrow_forward_ios</span> E-Hundi Donation</a></li>
              <li><a routerLink="/library" class="hover:text-amber-400 transition-colors flex items-center gap-2 justify-center md:justify-start group"><span class="material-icons text-[10px] text-stone-600 group-hover:text-amber-500 transition-colors">arrow_forward_ios</span> Spiritual Library</a></li>
            </ul>
          </div>

          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 class="text-lg font-bold text-white mb-6 uppercase tracking-widest text-xs border-b border-white/10 pb-3 inline-block">Darshan Timings</h3>
            <div class="space-y-3 text-sm w-full max-w-xs">
              <div class="flex justify-between border-b border-stone-800/50 pb-2 border-dashed group hover:border-stone-700 transition-colors">
                 <span class="text-stone-500 group-hover:text-stone-400 transition-colors">Suprabhatam</span>
                 <span class="text-amber-100 font-mono">{{ templeService.siteConfig().timings.suprabhatam }}</span>
              </div>
              <div class="flex justify-between border-b border-stone-800/50 pb-2 border-dashed group hover:border-stone-700 transition-colors">
                 <span class="text-stone-500 group-hover:text-stone-400 transition-colors">Morning</span>
                 <span class="text-amber-100 font-mono">{{ templeService.siteConfig().timings.morningDarshan }}</span>
              </div>
               <div class="flex justify-between border-b border-stone-800/50 pb-2 border-dashed group hover:border-stone-700 transition-colors">
                 <span class="text-stone-500 group-hover:text-stone-400 transition-colors">Evening</span>
                 <span class="text-amber-100 font-mono">{{ templeService.siteConfig().timings.eveningDarshan }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright Bar & Credits -->
        <div class="border-t border-stone-900/50 relative z-10 pt-8 pb-4">
          <div class="container mx-auto px-4 flex flex-col items-center justify-center gap-6">
             <p class="text-[10px] text-stone-500 font-medium tracking-widest opacity-60 hover:opacity-100 transition-opacity uppercase font-sans">
               &copy; 2026 Uttarandhra Tirumala. All Rights Reserved.
             </p>
             
             <!-- Enhanced Developer Credit with Gold Shimmer -->
             <div class="relative group cursor-default transform hover:scale-105 transition-transform duration-500">
                <!-- Outer Glow -->
                <div class="absolute -inset-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rounded-full blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                
                <!-- Pill Container -->
                <div class="relative flex flex-col md:flex-row items-center gap-2 md:gap-3 px-6 py-2.5 bg-[#0f0404] ring-1 ring-white/10 rounded-full shadow-2xl group-hover:ring-amber-500/30 transition-all duration-500">
                    
                    <span class="text-[9px] text-stone-500 uppercase tracking-[0.2em] font-bold group-hover:text-stone-400 transition-colors">
                      Designed & Developed by
                    </span>
                    
                    <span class="hidden md:block w-0.5 h-3 bg-stone-800 rounded-full"></span>
                    
                    <!-- Shiny Text -->
                    <span class="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-[length:200%_auto] bg-clip-text text-transparent font-serif font-bold text-xs tracking-[0.15em] uppercase animate-shine drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      JMRSai Technologies
                    </span>
                    
                    <!-- Tech Pulse Dot -->
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>
                </div>
             </div>
          </div>
        </div>
      </footer>

      <app-ai-chat></app-ai-chat>
    </div>
  `,
  styles: [`
    .animate-shine {
      animation: shine 3s linear infinite;
    }
    @keyframes shine {
      to {
        background-position: 200% center;
      }
    }
  `]
})
export class AppComponent {
  templeService = inject(TempleService);
  
  @ViewChild('bgMusic') bgMusicRef!: ElementRef<HTMLAudioElement>;
  
  isMusicPlaying = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  toggleMusic() {
    const audio = this.bgMusicRef.nativeElement;
    if (this.isMusicPlaying()) {
      audio.pause();
      this.isMusicPlaying.set(false);
    } else {
      audio.play().catch(e => console.error("Audio play failed", e));
      this.isMusicPlaying.set(true);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}