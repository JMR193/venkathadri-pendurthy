import { Component, inject, signal, computed, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TempleService, LibraryItem, Booking, NewsItem, GalleryItem, Donation, TempleInsights, Panchangam, SiteConfig, SevaType, InventoryItem, UserProfile, TempleEvent } from '../../core/services/temple.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { select, scaleBand, axisBottom, scaleLinear, max, axisLeft } from 'd3';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-stone-100 font-sans flex flex-col">
      
      <!-- Login Overlay -->
      @if (!templeService.isAdmin()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-sm animate-fade-in">
          <div class="bg-white p-8 rounded-xl shadow-2xl text-center border-t-4 border-amber-600 w-full max-w-md theme-border-primary relative">
             <!-- Back to Website -->
             <a routerLink="/" class="absolute top-4 left-4 text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1 font-bold">
               <span class="material-icons text-xs">arrow_back</span> Website
             </a>

             <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-icons theme-text-primary text-3xl">lock</span>
             </div>
             <h2 class="text-2xl font-serif font-bold mb-2 text-stone-800">Admin Access Required</h2>
             <p class="text-stone-500 mb-6 text-sm">Please authenticate to access the ERP System.</p>
             
             <div class="mb-4 text-left space-y-3">
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase mb-1">Email / Username</label>
                  <input type="text" [(ngModel)]="adminEmail" class="w-full p-3 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" placeholder="admin@uttarandhra.org">
                </div>
                <div>
                  <label class="block text-xs font-bold text-stone-500 uppercase mb-1">Password</label>
                  <input type="password" [(ngModel)]="adminPassword" (keyup.enter)="attemptLogin()" class="w-full p-3 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" placeholder="••••••••">
                </div>
                @if (loginError()) {
                  <p class="text-red-600 text-xs mt-1">Invalid credentials. Default: admin/admin123</p>
                }
             </div>

             <button (click)="attemptLogin()" class="theme-bg-primary text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity w-full">Login</button>
          </div>
        </div>
      }

      <div class="flex flex-1 overflow-hidden h-screen">
        
        <!-- Sidebar Navigation -->
        <aside class="w-64 bg-[#1a0a0a] text-amber-50 flex flex-col shadow-2xl z-20 border-r border-stone-800 flex-shrink-0">
          <div class="p-6 border-b border-stone-800 flex items-center gap-3 bg-[#1a0a0a]">
              <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-[#1a0a0a] font-bold shadow-lg">
                <span class="material-icons">temple_hindu</span>
              </div>
              <div>
                <h3 class="font-bold text-amber-100 tracking-wide">Temple ERP</h3>
                <p class="text-[10px] text-amber-500 uppercase tracking-widest">Administrator</p>
              </div>
          </div>

          <nav class="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <button (click)="setActiveTab('dashboard')" [class]="activeTab() === 'dashboard' ? 'theme-bg-primary text-white shadow-md' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-3 rounded-lg flex gap-3 transition-all items-center text-sm font-medium mb-4">
               <span class="material-icons text-sm">dashboard</span> Dashboard
            </button>

            <!-- Operational Management Group -->
            <p class="px-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-4 mb-2">Operational Management</p>
            
            <button (click)="setActiveTab('seva-bookings')" [class]="activeTab() === 'seva-bookings' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">spa</span> Pooja/Seva Bookings
            </button>
            <button (click)="setActiveTab('darshan-bookings')" [class]="activeTab() === 'darshan-bookings' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">visibility</span> Darshan Bookings
            </button>
            
            <button (click)="setActiveTab('inventory')" [class]="activeTab() === 'inventory' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">inventory_2</span> Inventory & Stock
            </button>
            <button (click)="setActiveTab('accommodation')" [class]="activeTab() === 'accommodation' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">bed</span> Accommodation
            </button>
            <button (click)="setActiveTab('insights')" [class]="activeTab() === 'insights' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">sensors</span> Live Control
            </button>

            <!-- CMS Group -->
            <p class="px-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-4 mb-2">Content & CMS</p>
            
            <button (click)="setActiveTab('content-editor')" [class]="activeTab() === 'content-editor' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">edit_document</span> Page Content
            </button>
            <button (click)="setActiveTab('events')" [class]="activeTab() === 'events' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">event</span> Event Calendar
            </button>
            <button (click)="setActiveTab('news')" [class]="activeTab() === 'news' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">campaign</span> News & Updates
            </button>
            <button (click)="setActiveTab('media')" [class]="activeTab() === 'media' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">perm_media</span> Media Library
            </button>
            <button (click)="setActiveTab('seo')" [class]="activeTab() === 'seo' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">search</span> SEO & Marketing
            </button>
            
            <!-- People Group -->
            <p class="px-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-4 mb-2">Admin & People</p>
            <button (click)="setActiveTab('users')" [class]="activeTab() === 'users' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">people</span> User Management
            </button>
             <button (click)="setActiveTab('feedback')" [class]="activeTab() === 'feedback' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">reviews</span> Feedback
            </button>
             <button (click)="setActiveTab('settings')" [class]="activeTab() === 'settings' ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-stone-900 hover:text-amber-100'" class="w-full text-left px-4 py-2 rounded-lg flex gap-3 transition-all items-center text-sm font-medium">
               <span class="material-icons text-sm">settings</span> Settings
            </button>
          </nav>
          
          <div class="p-4 border-t border-stone-800">
             <a routerLink="/" class="text-stone-500 hover:text-amber-400 flex items-center gap-2 text-sm font-bold transition-colors">
               <span class="material-icons text-sm">arrow_back</span> Back to Website
             </a>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-grow p-8 overflow-y-auto bg-stone-100">
          
          <!-- 1. DASHBOARD VIEW -->
          @if (activeTab() === 'dashboard') {
            <header class="flex justify-between items-center mb-8">
               <div>
                 <h2 class="text-3xl font-serif font-bold text-stone-800">Executive Overview</h2>
                 <p class="text-stone-500 text-sm">Real-time Temple Operations</p>
               </div>
               <div class="flex gap-3">
                 <div class="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
                   <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   System Online
                 </div>
               </div>
            </header>
            
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <div class="bg-white p-6 rounded-xl shadow-sm border-b-4 border-amber-500">
                  <p class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Total Donations</p>
                  <p class="text-3xl font-serif font-bold text-stone-800">₹ {{ templeService.totalDonations() | number }}</p>
               </div>
               <div class="bg-white p-6 rounded-xl shadow-sm border-b-4 border-red-600">
                  <p class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Active Bookings</p>
                  <p class="text-3xl font-serif font-bold text-stone-800">{{ templeService.bookings().length }}</p>
               </div>
               <div class="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500">
                   <p class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Prasad Stock</p>
                   <p class="text-3xl font-serif font-bold text-stone-800">{{ templeService.insights().ladduStock | number }}</p>
               </div>
               <div class="bg-white p-6 rounded-xl shadow-sm border-b-4 border-purple-500">
                   <p class="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Registered Users</p>
                   <p class="text-3xl font-serif font-bold text-stone-800">{{ templeService.users().length }}</p>
               </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
               <div class="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 class="font-bold text-stone-800 mb-6">Financial Overview</h3>
                  <div #chartContainer class="w-full h-64"></div>
               </div>
               <div class="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 class="font-bold text-stone-800 mb-6">Recent Operations</h3>
                   <div class="space-y-4">
                     @for(booking of templeService.bookings().slice(0, 4); track booking.id) {
                       <div class="flex items-center justify-between p-3 rounded-lg bg-stone-50">
                          <div class="flex items-center gap-3">
                             <div class="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-xs text-stone-600">
                               {{booking.name.charAt(0)}}
                             </div>
                             <div>
                                <p class="text-sm font-bold text-stone-800">{{booking.name}}</p>
                                <p class="text-xs text-stone-500">{{booking.type}}</p>
                             </div>
                          </div>
                          <span class="text-xs font-bold px-2 py-1 rounded" [ngClass]="{
                            'bg-green-100 text-green-700': booking.status === 'Confirmed',
                            'bg-yellow-100 text-yellow-700': booking.status === 'Pending',
                            'bg-red-100 text-red-700': booking.status === 'Cancelled'
                          }">{{booking.status}}</span>
                       </div>
                     }
                  </div>
               </div>
            </div>
          }

          <!-- CMS: CONTENT EDITOR -->
          @if (activeTab() === 'content-editor') {
             <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-stone-800">Static Page Content Manager</h2>
               <button (click)="saveSettings()" class="theme-bg-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                 <span class="material-icons text-sm">save</span> Save Changes
               </button>
             </div>
             
             <div class="grid grid-cols-1 gap-6">
                <!-- Main WYSIWYG Editor -->
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                   <div class="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 class="font-bold text-stone-800">Edit Page Content</h3>
                      <div class="flex bg-stone-100 p-1 rounded-lg">
                         <button (click)="changeEditorPage('history')" [class.bg-white]="editingPage === 'history'" [class.shadow-sm]="editingPage === 'history'" class="px-3 py-1 text-xs font-bold rounded transition-all">History</button>
                         <button (click)="changeEditorPage('about')" [class.bg-white]="editingPage === 'about'" [class.shadow-sm]="editingPage === 'about'" class="px-3 py-1 text-xs font-bold rounded transition-all">About Us</button>
                         <button (click)="changeEditorPage('contact')" [class.bg-white]="editingPage === 'contact'" [class.shadow-sm]="editingPage === 'contact'" class="px-3 py-1 text-xs font-bold rounded transition-all">Contact Us</button>
                      </div>
                   </div>
                   
                   <!-- WYSIWYG Toolbar -->
                   <div class="bg-stone-50 border border-stone-300 border-b-0 rounded-t-lg p-2 flex gap-2 flex-wrap items-center">
                      <button (click)="execCmd('bold')" class="p-1 hover:bg-stone-200 rounded" title="Bold"><span class="material-icons text-sm">format_bold</span></button>
                      <button (click)="execCmd('italic')" class="p-1 hover:bg-stone-200 rounded" title="Italic"><span class="material-icons text-sm">format_italic</span></button>
                      <button (click)="execCmd('underline')" class="p-1 hover:bg-stone-200 rounded" title="Underline"><span class="material-icons text-sm">format_underlined</span></button>
                      <div class="w-px h-6 bg-stone-300 mx-1"></div>
                      <button (click)="execCmd('justifyLeft')" class="p-1 hover:bg-stone-200 rounded" title="Align Left"><span class="material-icons text-sm">format_align_left</span></button>
                      <button (click)="execCmd('justifyCenter')" class="p-1 hover:bg-stone-200 rounded" title="Align Center"><span class="material-icons text-sm">format_align_center</span></button>
                      <button (click)="execCmd('justifyRight')" class="p-1 hover:bg-stone-200 rounded" title="Align Right"><span class="material-icons text-sm">format_align_right</span></button>
                      <div class="w-px h-6 bg-stone-300 mx-1"></div>
                      <button (click)="execCmd('insertUnorderedList')" class="p-1 hover:bg-stone-200 rounded" title="Bullet List"><span class="material-icons text-sm">format_list_bulleted</span></button>
                      <button (click)="execCmd('insertOrderedList')" class="p-1 hover:bg-stone-200 rounded" title="Numbered List"><span class="material-icons text-sm">format_list_numbered</span></button>
                      <div class="w-px h-6 bg-stone-300 mx-1"></div>
                      <button (click)="insertImage()" class="p-1 hover:bg-stone-200 rounded flex items-center gap-1" title="Insert Image"><span class="material-icons text-sm">add_photo_alternate</span> <span class="text-[10px] font-bold">IMG</span></button>
                      <button (click)="execCmd('formatBlock', 'H2')" class="p-1 hover:bg-stone-200 rounded font-bold text-xs" title="Heading 2">H2</button>
                      <button (click)="execCmd('formatBlock', 'H3')" class="p-1 hover:bg-stone-200 rounded font-bold text-xs" title="Heading 3">H3</button>
                   </div>
                   
                   <!-- Editable Area -->
                   <div #editorContentDiv contenteditable="true" 
                        class="w-full p-4 border border-stone-300 rounded-b-lg h-96 focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif leading-relaxed text-stone-700 overflow-y-auto prose prose-amber max-w-none"
                        (input)="onEditorInput($event)">
                   </div>
                   
                   <p class="text-xs text-stone-400 mt-2 text-right">Rich Text Editor Enabled. Use toolbar for formatting.</p>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                   <h3 class="font-bold text-stone-800 mb-4 border-b pb-2">Flash News Ticker</h3>
                   <input [(ngModel)]="tickerText" (change)="updateFlashNews()" class="w-full p-3 border border-stone-300 rounded font-mono text-sm">
                </div>
             </div>
          }

          <!-- CMS: NEWS & UPDATES -->
          @if (activeTab() === 'news') {
             <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-stone-800">News & Announcements</h2>
               <div class="text-xs text-stone-500 bg-white px-3 py-1 rounded border">
                  {{ templeService.news().length }} Active Posts
               </div>
             </div>

             <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Create News Form -->
                <div class="lg:col-span-1 bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-fit sticky top-4">
                   <h3 class="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
                     <span class="material-icons text-amber-600">post_add</span> Publish Update
                   </h3>
                   
                   <div class="space-y-4">
                      <div>
                         <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Headline</label>
                         <input [(ngModel)]="newsForm.title" placeholder="E.g. Brahmotsavam Schedule" class="w-full p-2 border border-stone-300 rounded focus:border-amber-500 focus:outline-none text-sm font-bold">
                      </div>
                      
                      <div>
                         <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Content</label>
                         <textarea [(ngModel)]="newsForm.content" placeholder="Details of the announcement..." class="w-full p-2 border border-stone-300 rounded focus:border-amber-500 focus:outline-none text-sm h-32 resize-none"></textarea>
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                         <!-- Image Upload -->
                         <div class="border-2 border-dashed border-stone-300 rounded-lg p-3 text-center hover:bg-stone-50 transition-colors cursor-pointer relative">
                            <input type="file" accept="image/*" (change)="handleNewsImage($event)" class="absolute inset-0 opacity-0 cursor-pointer">
                            @if (selectedNewsImage) {
                               <div class="text-xs text-green-600 font-bold truncate">{{ selectedNewsImage.name }}</div>
                            } @else {
                               <span class="material-icons text-stone-400 mb-1">image</span>
                               <p class="text-[10px] text-stone-500 font-bold uppercase">Add Image</p>
                            }
                         </div>

                         <!-- PDF Upload -->
                         <div class="border-2 border-dashed border-stone-300 rounded-lg p-3 text-center hover:bg-stone-50 transition-colors cursor-pointer relative">
                            <input type="file" accept=".pdf,.doc,.docx" (change)="handleNewsDoc($event)" class="absolute inset-0 opacity-0 cursor-pointer">
                            @if (selectedNewsDoc) {
                               <div class="text-xs text-blue-600 font-bold truncate">{{ selectedNewsDoc.name }}</div>
                            } @else {
                               <span class="material-icons text-stone-400 mb-1">attachment</span>
                               <p class="text-[10px] text-stone-500 font-bold uppercase">Attach PDF</p>
                            }
                         </div>
                      </div>

                      <button (click)="publishNews()" [disabled]="!newsForm.title || !newsForm.content" class="w-full theme-bg-primary text-white font-bold py-3 rounded hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                         <span class="material-icons text-sm">send</span> Publish Now
                      </button>
                   </div>
                </div>

                <!-- News List -->
                <div class="lg:col-span-2 space-y-4">
                   @if (templeService.news().length === 0) {
                      <div class="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                         <span class="material-icons text-4xl mb-2">newspaper</span>
                         <p>No announcements yet.</p>
                      </div>
                   }

                   @for (item of templeService.news(); track item.id) {
                      <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex gap-4 group hover:border-amber-300 transition-colors">
                         <div class="w-24 h-24 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden border border-stone-100">
                            @if (item.imageUrl) {
                               <img [src]="item.imageUrl" class="w-full h-full object-cover">
                            } @else {
                               <div class="w-full h-full flex items-center justify-center text-stone-300">
                                  <span class="material-icons">image_not_supported</span>
                               </div>
                            }
                         </div>
                         <div class="flex-grow">
                            <div class="flex justify-between items-start mb-1">
                               <h4 class="font-bold text-stone-800 text-lg">{{ item.title }}</h4>
                               <button (click)="deleteNews(item.id)" class="text-stone-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors" title="Delete Post">
                                  <span class="material-icons text-sm">delete</span>
                               </button>
                            </div>
                            <p class="text-xs text-amber-600 font-bold uppercase mb-2">{{ item.date | date:'medium' }}</p>
                            <p class="text-stone-600 text-sm line-clamp-2 mb-2">{{ item.content }}</p>
                            @if (item.attachmentUrl) {
                               <div class="inline-flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                                  <span class="material-icons text-[12px]">attachment</span> Document Attached
                               </div>
                            }
                         </div>
                      </div>
                   }
                </div>
             </div>
          }

          <!-- CMS: EVENT CALENDAR -->
          @if (activeTab() === 'events') {
             <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-stone-800">Event & Festival Calendar</h2>
               <button (click)="addEvent()" class="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                 <span class="material-icons text-sm">add_circle</span> Add Event
               </button>
             </div>

             <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <table class="w-full text-left text-sm">
                   <thead class="bg-stone-50 text-stone-500 uppercase text-xs border-b">
                      <tr>
                         <th class="p-4">Event Name</th>
                         <th class="p-4">Type</th>
                         <th class="p-4">Dates</th>
                         <th class="p-4">Status</th>
                         <th class="p-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-stone-100">
                      @for (evt of templeService.events(); track evt.id) {
                         <tr class="hover:bg-stone-50">
                            <td class="p-4 font-bold text-stone-800">{{ evt.title }}<br><span class="text-xs font-normal text-stone-500">{{ evt.description }}</span></td>
                            <td class="p-4"><span class="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">{{ evt.type }}</span></td>
                            <td class="p-4 text-stone-600">{{ evt.startDate | date }} - {{ evt.endDate | date }}</td>
                            <td class="p-4"><span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{{ evt.status }}</span></td>
                            <td class="p-4 text-right">
                               <button (click)="deleteEvent(evt.id)" class="text-red-500 hover:text-red-700"><span class="material-icons text-sm">delete</span></button>
                            </td>
                         </tr>
                      }
                   </tbody>
                </table>
             </div>
          }

          <!-- CMS: SEO & MARKETING -->
          @if (activeTab() === 'seo') {
             <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-stone-800">SEO & Social Media</h2>
               <button (click)="saveSettings()" class="theme-bg-primary text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                 <span class="material-icons text-sm">save</span> Save Changes
               </button>
             </div>

             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Meta Tags -->
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                   <h3 class="font-bold text-stone-800 mb-4 border-b pb-2">Search Engine Optimization</h3>
                   <div class="space-y-4">
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1">Meta Title</label>
                         <input [(ngModel)]="configForm.seo.metaTitle" class="w-full p-2 border rounded text-sm">
                      </div>
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1">Meta Description</label>
                         <textarea [(ngModel)]="configForm.seo.metaDescription" class="w-full p-2 border rounded text-sm h-24"></textarea>
                      </div>
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1">Keywords</label>
                         <input [(ngModel)]="configForm.seo.keywords" class="w-full p-2 border rounded text-sm">
                      </div>
                   </div>
                </div>

                <!-- Social Media -->
                <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                   <h3 class="font-bold text-stone-800 mb-4 border-b pb-2">Social Integrations</h3>
                   <div class="space-y-4">
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1 flex items-center gap-2"><span class="material-icons text-red-600 text-sm">smart_display</span> YouTube Channel</label>
                         <input [(ngModel)]="configForm.socialLinks.youtube" class="w-full p-2 border rounded text-sm">
                      </div>
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1 flex items-center gap-2"><span class="material-icons text-blue-600 text-sm">facebook</span> Facebook</label>
                         <input [(ngModel)]="configForm.socialLinks.facebook" class="w-full p-2 border rounded text-sm">
                      </div>
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1 flex items-center gap-2"><span class="material-icons text-green-600 text-sm">chat</span> WhatsApp Channel</label>
                         <input [(ngModel)]="configForm.whatsappChannel" class="w-full p-2 border rounded text-sm">
                      </div>
                      <!-- NEW FIELDS -->
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1 flex items-center gap-2"><span class="material-icons text-pink-600 text-sm">photo_camera</span> Instagram</label>
                         <input [(ngModel)]="configForm.socialLinks.instagram" class="w-full p-2 border rounded text-sm">
                      </div>
                      <div>
                         <label class="block text-xs font-bold uppercase mb-1 flex items-center gap-2"><span class="material-icons text-black text-sm">tag</span> Twitter / X</label>
                         <input [(ngModel)]="configForm.socialLinks.twitter" class="w-full p-2 border rounded text-sm">
                      </div>
                   </div>
                </div>
             </div>
          }

          <!-- CMS: MEDIA LIBRARY -->
          @if (activeTab() === 'media') {
             <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-stone-800">Media Library</h2>
               <div class="flex gap-2">
                 <button class="bg-stone-200 text-stone-700 px-4 py-2 rounded text-sm font-bold">Filter: Images</button>
                 <button class="bg-stone-200 text-stone-700 px-4 py-2 rounded text-sm font-bold">Filter: Videos</button>
               </div>
             </div>

             <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                @for (item of templeService.gallery(); track item.id) {
                   <div class="bg-white rounded border border-stone-200 overflow-hidden group relative aspect-square">
                      <img [src]="item.url" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button (click)="copyUrl(item.url)" class="text-white hover:text-amber-400" title="Copy URL"><span class="material-icons">content_copy</span></button>
                         <button (click)="templeService.deletePhoto(item.id)" class="text-white hover:text-red-400" title="Delete"><span class="material-icons">delete</span></button>
                      </div>
                   </div>
                }
                <!-- Upload Placeholder -->
                <div class="border-2 border-dashed border-stone-300 rounded flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 cursor-pointer p-4">
                   <span class="material-icons text-4xl mb-2">cloud_upload</span>
                   <span class="text-xs font-bold uppercase">Upload Media</span>
                </div>
             </div>
          }
          
          <!-- USER MANAGEMENT -->
          @if (activeTab() === 'users') {
             <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-stone-800">User Management</h2>
               <button (click)="openUserModal()" class="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                 <span class="material-icons text-sm">person_add</span> Add User
               </button>
             </div>

             <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-200">
                <table class="w-full text-left text-sm">
                   <thead class="bg-stone-50 text-stone-500 uppercase text-xs border-b">
                      <tr>
                         <th class="p-4">User Details</th>
                         <th class="p-4">Role</th>
                         <th class="p-4">Contact</th>
                         <th class="p-4">Last Active</th>
                         <th class="p-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-stone-100">
                      @for (user of templeService.users(); track user.id) {
                         <tr class="hover:bg-stone-50 group">
                            <td class="p-4">
                               <div class="flex items-center gap-3">
                                  <div class="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 uppercase">
                                     {{ user.name.charAt(0) }}
                                  </div>
                                  <div>
                                     <p class="font-bold text-stone-800">{{ user.name }}</p>
                                     <p class="text-xs text-stone-500">{{ user.email }}</p>
                                  </div>
                               </div>
                            </td>
                            <td class="p-4">
                               <span class="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider" [ngClass]="{
                                  'bg-red-100 text-red-800': user.role === 'Super Admin',
                                  'bg-amber-100 text-amber-800': user.role === 'Admin',
                                  'bg-orange-100 text-orange-800': user.role === 'Priest',
                                  'bg-blue-100 text-blue-800': user.role === 'Staff',
                                  'bg-stone-100 text-stone-600': user.role === 'Devotee'
                               }">{{ user.role }}</span>
                            </td>
                            <td class="p-4 text-stone-600 font-mono text-xs">{{ user.phone }}</td>
                            <td class="p-4 text-stone-500 text-xs">{{ user.lastActive | date:'short' }}</td>
                            <td class="p-4 text-right">
                               <button (click)="openUserModal(user)" class="text-stone-400 hover:text-amber-600 mr-2"><span class="material-icons text-sm">edit</span></button>
                               <button (click)="deleteUser(user.id)" class="text-stone-400 hover:text-red-600"><span class="material-icons text-sm">delete</span></button>
                            </td>
                         </tr>
                      }
                   </tbody>
                </table>
             </div>
          }

          <!-- 2. BOOKINGS MANAGEMENT (Reused logic) -->
          @if (activeTab() === 'seva-bookings' || activeTab() === 'darshan-bookings') {
            <div class="mb-6 flex justify-between items-center">
              <h2 class="text-2xl font-bold text-stone-800">{{ bookingTitle() }}</h2>
              <button class="bg-stone-800 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
                 <span class="material-icons text-sm">download</span> Export Report
              </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-200">
              <table class="w-full text-left text-sm">
                <thead class="bg-stone-50 text-stone-500 font-bold uppercase text-xs border-b border-stone-200">
                  <tr>
                    <th class="p-4">Devotee</th>
                    <th class="p-4">Seva / Darshan</th>
                    <th class="p-4">Date</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-100">
                  @for (booking of filteredBookings(); track booking.id) {
                    <tr class="hover:bg-stone-50">
                      <td class="p-4">
                        <p class="font-bold text-stone-800">{{booking.name}}</p>
                        <p class="text-xs text-stone-500">{{booking.phone || 'N/A'}}</p>
                      </td>
                      <td class="p-4">{{booking.type}}</td>
                      <td class="p-4">{{booking.date}}</td>
                      <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs font-bold" [ngClass]="{
                            'bg-green-100 text-green-700': booking.status === 'Confirmed',
                            'bg-yellow-100 text-yellow-700': booking.status === 'Pending',
                            'bg-blue-100 text-blue-700': booking.status === 'Completed',
                            'bg-red-100 text-red-700': booking.status === 'Cancelled'
                        }">{{booking.status}}</span>
                      </td>
                      <td class="p-4 text-right space-x-2">
                         @if(booking.status === 'Confirmed') {
                           <button (click)="updateBookingStatus(booking.id, 'Completed')" class="text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-bold">Check In</button>
                           <button (click)="updateBookingStatus(booking.id, 'Cancelled')" class="text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200 text-xs font-bold">Cancel</button>
                         }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- 3. INVENTORY MANAGEMENT -->
          @if (activeTab() === 'inventory') {
             <div class="mb-6 flex justify-between items-center">
              <h2 class="text-2xl font-bold text-stone-800">Inventory & Stock</h2>
              <button (click)="addInventoryItem()" class="bg-amber-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 font-bold">
                 <span class="material-icons text-sm">add</span> Add Item
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               @for (item of templeService.inventory(); track item.id) {
                  <div class="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative overflow-hidden">
                     @if(item.stock <= item.lowStockThreshold) {
                        <div class="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1 font-bold uppercase rounded-bl">Low Stock</div>
                     }
                     <div class="flex justify-between items-start mb-4">
                        <div>
                           <h3 class="font-bold text-lg text-stone-800">{{item.name}}</h3>
                           <p class="text-xs text-stone-500 uppercase">{{item.category}}</p>
                        </div>
                        <div class="text-right">
                           <p class="text-2xl font-mono font-bold" [class.text-red-600]="item.stock <= item.lowStockThreshold">{{item.stock}}</p>
                           <p class="text-xs text-stone-400">{{item.unit}}</p>
                        </div>
                     </div>
                     <div class="flex gap-2">
                        <button (click)="updateStock(item.id, item.stock - 10)" class="flex-1 bg-stone-100 hover:bg-stone-200 py-2 rounded text-stone-600 font-bold text-sm">-10</button>
                        <button (click)="updateStock(item.id, item.stock + 50)" class="flex-1 bg-amber-50 hover:bg-amber-100 py-2 rounded text-amber-700 font-bold text-sm">+50</button>
                     </div>
                  </div>
               }
            </div>
          }
          
           <!-- 4. ACCOMMODATION -->
          @if (activeTab() === 'accommodation') {
             <h2 class="text-2xl font-bold text-stone-800 mb-6">Accommodation & Halls</h2>
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                @for (room of templeService.accommodationList(); track room.id) {
                   <div class="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex justify-between items-center">
                      <div>
                         <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-bold text-lg text-stone-800">{{room.name}}</h3>
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">{{room.type}}</span>
                         </div>
                         <p class="text-sm text-stone-500">Capacity: {{room.capacity}} | ₹{{room.pricePerDay}}/day</p>
                      </div>
                      <div class="flex flex-col items-end gap-2">
                         <span class="px-3 py-1 rounded-full text-xs font-bold uppercase" [ngClass]="{
                            'bg-green-100 text-green-700': room.status === 'Available',
                            'bg-red-100 text-red-700': room.status === 'Occupied',
                            'bg-orange-100 text-orange-700': room.status === 'Maintenance'
                         }">{{room.status}}</span>
                         <div class="flex gap-1">
                            <button (click)="updateRoomStatus(room.id, 'Available')" *ngIf="room.status !== 'Available'" class="text-xs text-green-600 hover:underline">Mark Available</button>
                            <button (click)="updateRoomStatus(room.id, 'Occupied')" *ngIf="room.status === 'Available'" class="text-xs text-blue-600 hover:underline">Check In</button>
                         </div>
                      </div>
                   </div>
                }
             </div>
          }

          <!-- Live Insights Editor -->
          @if (activeTab() === 'insights') {
             <h2 class="text-2xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-300">Live Temple Operations</h2>
             <div class="bg-white p-8 rounded-xl shadow-sm border border-stone-200 max-w-4xl">
                <div class="mb-8">
                  <label class="block text-sm font-bold text-stone-800 mb-2">Live Stream URL (Embed)</label>
                  <input [(ngModel)]="configForm.liveLink" class="w-full p-3 border rounded text-stone-600">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <label class="block text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <span class="material-icons">hourglass_top</span> Darshan Wait Time (Mins)
                      </label>
                      <div class="flex items-center gap-4">
                        <button (click)="insightsForm.darshanWaitTime = Math.max(0, insightsForm.darshanWaitTime - 5)" class="w-12 h-12 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold text-xl">-</button>
                        <input type="number" [(ngModel)]="insightsForm.darshanWaitTime" class="flex-grow p-4 text-4xl font-bold text-blue-900 bg-white border border-blue-200 rounded-lg text-center shadow-inner">
                        <button (click)="insightsForm.darshanWaitTime = insightsForm.darshanWaitTime + 5" class="w-12 h-12 rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold text-xl">+</button>
                      </div>
                   </div>
                   <button (click)="updateInsights()" class="mt-8 w-full theme-bg-primary hover:opacity-90 text-white font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
                     <span class="material-icons">save</span> Save Changes to Live Dashboard
                   </button>
                </div>
             </div>
          }
          
          @if (activeTab() === 'settings') {
             <header class="mb-8 flex justify-between items-end">
               <h2 class="text-2xl font-bold text-stone-800">System Settings</h2>
               <button (click)="saveSettings()" class="theme-bg-primary text-white px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity">Save Changes</button>
             </header>
             <div class="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mb-6">
                <h3 class="font-bold text-stone-800 mb-4 border-b pb-2">Maintenance Mode</h3>
                <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                   <div>
                     <p class="font-bold text-stone-800">Enable Maintenance</p>
                     <p class="text-xs text-stone-500">Disable public access.</p>
                   </div>
                   <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [(ngModel)]="configForm.maintenanceMode" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                   </label>
                </div>
             </div>

             <!-- General Contact Info Settings -->
             <div class="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mb-6">
                <h3 class="font-bold text-stone-800 mb-4 border-b pb-2">General Contact Info</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase mb-1">Phone Number</label>
                        <input [(ngModel)]="configForm.contactPhone" class="w-full p-2 border rounded text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase mb-1">Email Address</label>
                        <input [(ngModel)]="configForm.contactEmail" class="w-full p-2 border rounded text-sm">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-xs font-bold uppercase mb-1">Physical Address</label>
                        <textarea [(ngModel)]="configForm.address" class="w-full p-2 border rounded text-sm h-20 resize-none"></textarea>
                    </div>
                </div>
             </div>

             <!-- Theme Customization -->
             <div class="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h3 class="font-bold text-stone-800 mb-4 border-b pb-2">Theme Customization</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label class="block text-xs font-bold uppercase mb-1">Primary Color</label>
                      <div class="flex gap-2">
                         <input type="color" [(ngModel)]="configForm.theme.primaryColor" class="h-10 w-10 p-1 rounded border border-stone-300 cursor-pointer">
                         <input type="text" [(ngModel)]="configForm.theme.primaryColor" class="flex-1 p-2 border rounded text-sm uppercase">
                      </div>
                   </div>
                   <div>
                      <label class="block text-xs font-bold uppercase mb-1">Secondary Color</label>
                      <div class="flex gap-2">
                         <input type="color" [(ngModel)]="configForm.theme.secondaryColor" class="h-10 w-10 p-1 rounded border border-stone-300 cursor-pointer">
                         <input type="text" [(ngModel)]="configForm.theme.secondaryColor" class="flex-1 p-2 border rounded text-sm uppercase">
                      </div>
                   </div>
                   <div>
                      <label class="block text-xs font-bold uppercase mb-1">Accent Color</label>
                      <div class="flex gap-2">
                         <input type="color" [(ngModel)]="configForm.theme.accentColor" class="h-10 w-10 p-1 rounded border border-stone-300 cursor-pointer">
                         <input type="text" [(ngModel)]="configForm.theme.accentColor" class="flex-1 p-2 border rounded text-sm uppercase">
                      </div>
                   </div>
                   <div>
                      <label class="block text-xs font-bold uppercase mb-1">Background Tone</label>
                      <div class="flex gap-2">
                         <input type="color" [(ngModel)]="configForm.theme.backgroundColor" class="h-10 w-10 p-1 rounded border border-stone-300 cursor-pointer">
                         <input type="text" [(ngModel)]="configForm.theme.backgroundColor" class="flex-1 p-2 border rounded text-sm uppercase">
                      </div>
                   </div>
                </div>
                <div class="mt-6 p-4 bg-stone-50 rounded border border-stone-200 text-sm">
                   <p class="font-bold mb-2 text-stone-500 uppercase text-xs">Live Preview</p>
                   <div class="flex flex-wrap gap-4 items-center">
                      <button class="px-6 py-2 text-white rounded font-bold shadow-md transition-transform active:scale-95" [style.background-color]="configForm.theme.primaryColor">Primary Action</button>
                      <button class="px-6 py-2 text-white rounded font-bold shadow-md transition-transform active:scale-95" [style.background-color]="configForm.theme.secondaryColor">Secondary Action</button>
                      <div class="font-bold text-lg" [style.color]="configForm.theme.accentColor">Accent Text Example</div>
                      <div class="w-10 h-10 rounded-full border-2" [style.border-color]="configForm.theme.primaryColor" [style.background-color]="configForm.theme.backgroundColor"></div>
                   </div>
                </div>
             </div>
          }

        </main>
      </div>

      <!-- User Modal -->
      @if (showUserModal()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div class="theme-bg-primary text-white p-4 flex justify-between items-center">
                 <h3 class="font-bold">{{ editingUserId ? 'Edit User' : 'Add New User' }}</h3>
                 <button (click)="showUserModal.set(false)" class="text-stone-300 hover:text-white"><span class="material-icons">close</span></button>
              </div>
              <div class="p-6 space-y-4">
                 <div>
                    <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Full Name</label>
                    <input [(ngModel)]="userForm.name" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none">
                 </div>
                 <div>
                    <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Email Address</label>
                    <input [(ngModel)]="userForm.email" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none">
                 </div>
                 <div>
                    <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Phone Number</label>
                    <input [(ngModel)]="userForm.phone" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none">
                 </div>
                 <div>
                    <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Role</label>
                    <select [(ngModel)]="userForm.role" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                       <option value="Super Admin">Super Admin</option>
                       <option value="Admin">Admin</option>
                       <option value="Priest">Priest</option>
                       <option value="Staff">Staff</option>
                       <option value="Devotee">Devotee</option>
                    </select>
                 </div>
                 <button (click)="saveUser()" class="w-full bg-amber-600 text-white font-bold py-3 rounded hover:bg-amber-700 transition-colors mt-2">
                    {{ editingUserId ? 'Update User' : 'Create User' }}
                 </button>
              </div>
           </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent implements AfterViewInit {
  templeService = inject(TempleService);
  activeTab = signal<string>('dashboard');
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('editorContentDiv') editorContentDiv!: ElementRef;
  
  tickerText = '';
  Math = Math;
  
  // Login State
  adminEmail = '';
  adminPassword = '';
  loginError = signal(false);

  // Forms with Two-Way Binding
  panchangamForm: Panchangam = { ...this.templeService.dailyPanchangam() };
  insightsForm: TempleInsights = { ...this.templeService.insights() };
  configForm: SiteConfig = { ...this.templeService.siteConfig() };

  // Content Editor State
  editingPage: 'history' | 'about' | 'contact' = 'history';

  // News State
  newsForm = { title: '', content: '' };
  selectedNewsImage: File | null = null;
  selectedNewsDoc: File | null = null;

  // User Management State
  showUserModal = signal(false);
  editingUserId: string | null = null;
  userForm = {
    name: '',
    email: '',
    phone: '',
    role: 'Devotee' as UserProfile['role']
  };
  
  // Computed properties
  filteredBookings = computed(() => {
     const bookings = this.templeService.bookings();
     const tab = this.activeTab();
     if (tab === 'darshan-bookings') {
       return bookings.filter(b => b.type.toLowerCase().includes('darshan'));
     }
     if (tab === 'seva-bookings') {
       return bookings.filter(b => !b.type.toLowerCase().includes('darshan'));
     }
     return bookings;
  });

  bookingTitle = computed(() => {
      const tab = this.activeTab();
      if (tab === 'darshan-bookings') return 'Darshan Booking Management';
      if (tab === 'seva-bookings') return 'Pooja/Seva Management';
      return 'Booking Management';
  });

  constructor() {
      // Sync forms
      effect(() => {
          this.tickerText = this.templeService.flashNews();
          this.insightsForm = JSON.parse(JSON.stringify(this.templeService.insights()));
          this.configForm = JSON.parse(JSON.stringify(this.templeService.siteConfig()));
          // Ensure nested objects exist
          if (!this.configForm.seo) this.configForm.seo = { metaTitle: '', metaDescription: '', keywords: '' };
          if (!this.configForm.socialLinks) this.configForm.socialLinks = { };
          // Ensure theme object exists
          if (!this.configForm.theme) this.configForm.theme = { primaryColor: '#800000', secondaryColor: '#d97706', accentColor: '#fbbf24', backgroundColor: '#fffbeb' };
          
          this.updateEditorContent();
      });
      
      effect(() => {
        if (this.activeTab() === 'dashboard') {
          setTimeout(() => this.renderChart(), 100);
        }
      });
  }
  
  ngAfterViewInit() {
    if (this.activeTab() === 'dashboard') {
      this.renderChart();
    }
    this.updateEditorContent();
  }
  
  attemptLogin() {
    if(this.templeService.loginAdmin(this.adminEmail, this.adminPassword)) {
       this.loginError.set(false);
    } else {
       this.loginError.set(true);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    if (tab === 'dashboard') {
      setTimeout(() => this.renderChart(), 100);
    }
    if (tab === 'content-editor') {
        setTimeout(() => this.updateEditorContent(), 100);
    }
  }

  // --- Content Editor Logic ---
  changeEditorPage(page: 'history' | 'about' | 'contact') {
    this.editingPage = page;
    this.updateEditorContent();
  }

  updateEditorContent() {
    if (this.editorContentDiv && this.editorContentDiv.nativeElement) {
      let content = '';
      if (this.editingPage === 'history') content = this.configForm.historyContent;
      else if (this.editingPage === 'about') content = this.configForm.aboutUsContent || '';
      else if (this.editingPage === 'contact') content = this.configForm.contactUsContent || '';
      
      this.editorContentDiv.nativeElement.innerHTML = content;
    }
  }

  onEditorInput(event: any) {
    const content = event.target.innerHTML;
    if (this.editingPage === 'history') this.configForm.historyContent = content;
    else if (this.editingPage === 'about') this.configForm.aboutUsContent = content;
    else if (this.editingPage === 'contact') this.configForm.contactUsContent = content;
  }

  execCmd(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    // Trigger input event to save state
    if (this.editorContentDiv) {
        this.onEditorInput({ target: this.editorContentDiv.nativeElement });
    }
  }

  insertImage() {
    const url = prompt('Enter Image URL:');
    if (url) {
      this.execCmd('insertImage', url);
    }
  }

  // --- Chart Logic ---
  renderChart() {
    if (!this.chartContainer || !this.chartContainer.nativeElement) return;
    select(this.chartContainer.nativeElement).selectAll('*').remove();

    const donations = this.templeService.donations();
    const dataMap = new Map<string, number>();
    donations.forEach(d => {
       const current = dataMap.get(d.category) || 0;
       dataMap.set(d.category, current + d.amount);
    });
    
    const data = Array.from(dataMap, ([category, value]) => ({ category, value }));
    if (data.length === 0) {
      select(this.chartContainer.nativeElement).append('p').text('No data available').attr('class', 'text-stone-400 p-4');
      return;
    }

    const margin = {top: 20, right: 20, bottom: 40, left: 60};
    const width = this.chartContainer.nativeElement.offsetWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = select(this.chartContainer.nativeElement)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = scaleBand().range([ 0, width ]).domain(data.map(d => d.category)).padding(0.2);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-25)")
      .style("text-anchor", "end");

    const y = scaleLinear().domain([0, max(data, d => d.value) || 100]).range([ height, 0]);
    svg.append("g").call(axisLeft(y));

    svg.selectAll("mybar").data(data).enter().append("rect")
      .attr("x", d => x(d.category) || 0).attr("y", d => y(d.value)).attr("width", x.bandwidth()).attr("height", d => height - y(d.value))
      .attr("fill", "#d97706");
  }

  saveSettings() {
    this.templeService.updateSiteConfig(this.configForm);
    alert('Site settings updated successfully!');
  }
  
  updateFlashNews() {
     this.templeService.updateFlashNews(this.tickerText);
  }

  updateInsights() {
      this.templeService.updateInsights(this.insightsForm);
      this.templeService.updateSiteConfig(this.configForm); // Save live link too
      alert('Live Dashboard Updated Successfully');
  }

  // News Logic
  handleNewsImage(event: any) { this.selectedNewsImage = event.target.files[0]; }
  handleNewsDoc(event: any) { this.selectedNewsDoc = event.target.files[0]; }
  
  publishNews() {
     // Mock Uploads using ObjectURL
     const imgUrl = this.selectedNewsImage ? URL.createObjectURL(this.selectedNewsImage) : undefined;
     const docUrl = this.selectedNewsDoc ? URL.createObjectURL(this.selectedNewsDoc) : undefined;
     
     this.templeService.addNews(this.newsForm.title, this.newsForm.content, docUrl, imgUrl);
     
     // Reset
     this.newsForm = { title: '', content: '' };
     this.selectedNewsImage = null;
     this.selectedNewsDoc = null;
     alert('News published successfully!');
  }
  
  deleteNews(id: string) { if(confirm('Delete this announcement?')) this.templeService.deleteNews(id); }

  updateBookingStatus(id: string, status: any) { this.templeService.updateBookingStatus(id, status); }
  updateStock(id: string, newStock: number) { this.templeService.updateInventory(id, Math.max(0, newStock)); }
  addInventoryItem() {
    const name = prompt('Item Name:');
    if(name) { this.templeService.addInventoryItem({ name, category: 'Prasad', stock: 0, unit: 'Units', lowStockThreshold: 10 }); }
  }
  updateRoomStatus(id: string, status: any) { this.templeService.updateRoomStatus(id, status); }
  copyUrl(url: string) { navigator.clipboard.writeText(url); alert('URL Copied'); }
  
  addEvent() {
    const title = prompt("Event Title:");
    if (title) {
       this.templeService.addEvent({ 
         title, 
         description: 'New Event', 
         type: 'Festival', 
         status: 'Upcoming', 
         startDate: new Date().toISOString(), 
         endDate: new Date().toISOString() 
       });
    }
  }
  deleteEvent(id: string) { if(confirm('Delete?')) this.templeService.deleteEvent(id); }

  // User Management
  openUserModal(user?: UserProfile) {
    if (user) {
      this.editingUserId = user.id;
      this.userForm = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      };
    } else {
      this.editingUserId = null;
      this.userForm = { name: '', email: '', phone: '', role: 'Devotee' };
    }
    this.showUserModal.set(true);
  }

  saveUser() {
    if (this.editingUserId) {
      this.templeService.updateUserProfile(this.editingUserId, this.userForm);
    } else {
      this.templeService.addUser(this.userForm);
    }
    this.showUserModal.set(false);
  }

  deleteUser(id: string) {
     if(confirm('Are you sure you want to remove this user?')) this.templeService.deleteUser(id);
  }
}