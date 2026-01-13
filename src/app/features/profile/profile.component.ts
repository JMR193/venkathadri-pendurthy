import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TempleService } from '../../core/services/temple.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-stone-50 py-12 px-4">
      <div class="max-w-5xl mx-auto relative">
        
        <!-- Back Button -->
        <button (click)="goBack()" class="absolute -top-10 left-0 flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold text-sm">
           <span class="material-icons text-sm">arrow_back</span> Back
        </button>

        @if (!templeService.currentUser()) {
          <!-- Authentication View -->
          <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100 transition-all mt-4">
            <div class="theme-bg-primary p-8 text-center relative overflow-hidden">
               <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/mandala.png')]"></div>
               <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                  <span class="material-icons text-amber-700 text-4xl">{{ authMode === 'login' ? 'login' : 'person_add' }}</span>
               </div>
               <h2 class="text-2xl font-serif font-bold text-white">{{ authMode === 'login' ? 'Devotee Login' : 'Create Account' }}</h2>
               <p class="text-amber-200 text-sm mt-1">Join our spiritual community</p>
            </div>
            
            <div class="p-8">
               
               <!-- LOGIN FORM -->
               @if (authMode === 'login') {
                 <div class="space-y-4">
                   <div>
                     <label class="block text-sm font-bold text-stone-700 mb-2">Email Address</label>
                     <input type="email" [(ngModel)]="loginData.email" placeholder="devotee@example.com" class="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                   </div>
                   <div>
                     <label class="block text-sm font-bold text-stone-700 mb-2">Password</label>
                     <input type="password" [(ngModel)]="loginData.password" placeholder="••••••••" class="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                   </div>
                   
                   <button (click)="onLogin()" class="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center gap-2">
                     Login <span class="material-icons text-sm">login</span>
                   </button>
                   
                   <div class="mt-6 text-center pt-4 border-t border-stone-100">
                     <p class="text-stone-500 text-sm">Don't have an account?</p>
                     <button (click)="switchMode('signup')" class="text-amber-700 font-bold hover:underline">Sign Up Now</button>
                   </div>
                 </div>
               }

               <!-- SIGN UP FORM -->
               @if (authMode === 'signup') {
                 <div class="space-y-4 animate-fade-in">
                    <div>
                       <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Full Name</label>
                       <input type="text" [(ngModel)]="signupData.name" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none">
                    </div>
                    <div>
                       <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Email Address</label>
                       <input type="email" [(ngModel)]="signupData.email" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none">
                    </div>
                    <div>
                       <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Mobile Number</label>
                       <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">+91</span>
                          <input type="tel" [(ngModel)]="signupData.phone" placeholder="9999999999" class="w-full pl-10 p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none font-bold tracking-wider">
                       </div>
                    </div>
                    <div>
                       <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Password</label>
                       <input type="password" [(ngModel)]="signupData.password" class="w-full p-2 border border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none">
                    </div>

                    <button (click)="onSignup()" class="w-full bg-stone-800 text-white font-bold py-3 rounded-lg shadow hover:bg-black transition-all mt-2">
                       Create Account
                    </button>

                    <div class="mt-4 text-center">
                       <p class="text-stone-500 text-sm">Already registered?</p>
                       <button (click)="switchMode('login')" class="text-amber-700 font-bold hover:underline">Login Here</button>
                    </div>
                 </div>
               }

            </div>
          </div>
        } @else {
          <!-- Dashboard View -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
             
             <!-- Sidebar / Profile Card -->
             <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-md overflow-hidden border border-stone-100 sticky top-24">
                   <div class="bg-gradient-to-br from-stone-800 to-stone-900 p-8 text-center text-white relative">
                      <div class="absolute top-4 right-4">
                         <button (click)="templeService.logout()" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">Logout</button>
                      </div>
                      <div class="w-24 h-24 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-4 border-stone-700">
                         {{ templeService.currentUser()?.name?.charAt(0) }}
                      </div>
                      <h2 class="text-xl font-bold font-serif">{{ templeService.currentUser()?.name }}</h2>
                      <p class="text-stone-400 text-sm">{{ templeService.currentUser()?.email }}</p>
                      <div class="mt-4 flex justify-center gap-2">
                         <span class="bg-amber-600/20 text-amber-400 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">Verified Devotee</span>
                      </div>
                   </div>
                   
                   <div class="p-4">
                      <nav class="space-y-1">
                         <button (click)="activeTab = 'overview'" [class]="activeTab === 'overview' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-stone-600 hover:bg-stone-50'" class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
                            <span class="material-icons text-sm">dashboard</span> Overview
                         </button>
                         <button (click)="activeTab = 'bookings'" [class]="activeTab === 'bookings' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-stone-600 hover:bg-stone-50'" class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
                            <span class="material-icons text-sm">confirmation_number</span> My Bookings
                         </button>
                         <button (click)="activeTab = 'donations'" [class]="activeTab === 'donations' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-stone-600 hover:bg-stone-50'" class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors">
                            <span class="material-icons text-sm">volunteer_activism</span> Donation History
                         </button>
                      </nav>
                   </div>
                </div>
             </div>

             <!-- Main Content -->
             <div class="lg:col-span-2 space-y-6">
                
                @if (activeTab === 'overview') {
                   <!-- Welcome Banner -->
                   <div class="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                         <h3 class="font-serif font-bold text-amber-900 text-lg">Namaste, {{ templeService.currentUser()?.name }}</h3>
                         <p class="text-amber-800 text-sm">May Lord Venkateswara bless you and your family.</p>
                      </div>
                      <span class="material-icons text-4xl text-amber-300">spa</span>
                   </div>

                   <!-- Quick Stats -->
                   <div class="grid grid-cols-2 gap-4">
                      <div class="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                         <p class="text-xs text-stone-400 uppercase font-bold">Total Darshans</p>
                         <p class="text-3xl font-serif font-bold text-stone-800">{{ templeService.currentUser()?.bookings?.length || 0 }}</p>
                      </div>
                      <div class="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                         <p class="text-xs text-stone-400 uppercase font-bold">Total Contributions</p>
                         <p class="text-3xl font-serif font-bold text-stone-800">₹ {{ getTotalDonations() | number }}</p>
                      </div>
                   </div>

                   <!-- Next Event Teaser -->
                   <div class="bg-stone-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer" routerLink="/booking">
                      <div class="absolute right-0 top-0 w-32 h-32 bg-amber-500 rounded-full blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <h4 class="font-serif font-bold text-lg mb-2 relative z-10">Plan Your Next Visit</h4>
                      <p class="text-stone-300 text-sm mb-4 relative z-10 max-w-sm">Special Darshan slots are available for the upcoming Ekadashi. Book now to avoid the queue.</p>
                      <button class="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold relative z-10 hover:bg-amber-500 transition-colors">Book Darshan</button>
                   </div>
                }

                @if (activeTab === 'bookings') {
                   <h3 class="font-bold text-xl text-stone-800 mb-4">Your Spiritual Journey</h3>
                   @if (templeService.currentUser()?.bookings?.length === 0) {
                      <div class="text-center py-12 bg-white rounded-xl border border-stone-200">
                         <p class="text-stone-400">No bookings found yet.</p>
                         <button routerLink="/booking" class="text-amber-600 font-bold text-sm mt-2 hover:underline">Book your first Seva</button>
                      </div>
                   }
                   <div class="space-y-4">
                      @for (booking of templeService.currentUser()?.bookings; track booking.id) {
                         <div class="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center">
                            <div class="flex items-center gap-4">
                               <div class="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                                  <span class="material-icons">event</span>
                               </div>
                               <div>
                                  <h4 class="font-bold text-stone-800">{{ booking.type }}</h4>
                                  <p class="text-xs text-stone-500">{{ booking.date | date:'fullDate' }}</p>
                               </div>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="{
                               'bg-green-100 text-green-700': booking.status === 'Confirmed' || booking.status === 'Completed',
                               'bg-yellow-100 text-yellow-700': booking.status === 'Pending'
                            }">{{ booking.status }}</span>
                         </div>
                      }
                   </div>
                }

                @if (activeTab === 'donations') {
                   <h3 class="font-bold text-xl text-stone-800 mb-4">Donation History</h3>
                   @if (templeService.currentUser()?.donations?.length === 0) {
                      <div class="text-center py-12 bg-white rounded-xl border border-stone-200">
                         <p class="text-stone-400">No donations recorded.</p>
                         <button routerLink="/e-hundi" class="text-amber-600 font-bold text-sm mt-2 hover:underline">Make an Offering</button>
                      </div>
                   }
                   <div class="space-y-4">
                      @for (donation of templeService.currentUser()?.donations; track donation.id) {
                         <div class="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                            <div class="flex justify-between items-start mb-2">
                               <div>
                                  <span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">{{ donation.category }}</span>
                                  <h4 class="font-bold text-stone-800 text-lg mt-1">₹ {{ donation.amount | number }}</h4>
                               </div>
                               <button class="text-stone-400 hover:text-stone-600" title="Download Receipt">
                                  <span class="material-icons">download</span>
                               </button>
                            </div>
                            <div class="flex justify-between text-xs text-stone-500 pt-2 border-t border-stone-100 mt-2">
                               <span>TXN: {{ donation.transactionId }}</span>
                               <span>{{ donation.date | date:'mediumDate' }}</span>
                            </div>
                         </div>
                      }
                   </div>
                }

             </div>
          </div>
        }

      </div>
    </div>
  `
})
export class ProfileComponent {
  templeService = inject(TempleService);
  location = inject(Location);
  activeTab: 'overview' | 'bookings' | 'donations' = 'overview';

  // Auth State
  authMode: 'login' | 'signup' = 'login';
  
  // Forms
  loginData = { email: '', password: '' };
  signupData = { name: '', email: '', phone: '', password: '' };

  switchMode(mode: 'login' | 'signup') {
    this.authMode = mode;
    this.loginData = { email: '', password: '' };
  }

  onLogin() {
     if (this.templeService.loginDevotee(this.loginData.email, this.loginData.password)) {
        // Success
     } else {
        alert('Invalid email or password. Please try again.');
     }
  }

  onSignup() {
     if (!this.signupData.name || !this.signupData.email || !this.signupData.password) {
        alert('All fields are required.');
        return;
     }
     
     if (this.templeService.registerDevotee(this.signupData.name, this.signupData.email, this.signupData.phone, this.signupData.password)) {
        alert('Registration Successful! Welcome to Uttarandhra Tirumala.');
     } else {
        alert('Registration failed. This email might already be registered.');
     }
  }

  getTotalDonations() {
     return this.templeService.currentUser()?.donations?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  }

  goBack() {
    this.location.back();
  }
}