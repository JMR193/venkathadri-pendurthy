import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { TempleService } from '../../core/services/temple.service';

@Component({
  selector: 'app-ehundi',
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-stone-50 min-h-screen py-12 relative">
      <!-- Back Button -->
      <button (click)="goBack()" class="absolute top-4 left-4 flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold text-sm z-10">
         <span class="material-icons text-sm">arrow_back</span> Back
      </button>

      <div class="container mx-auto px-4 mt-4">
        
        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:max-w-full relative border border-stone-200">
          
          <!-- Secure Header -->
          <div class="theme-bg-primary text-white p-6 flex justify-between items-center relative z-20">
             <div class="flex items-center gap-3">
                <span class="material-icons text-3xl text-amber-400">lock_person</span>
                <div>
                   <h2 class="text-xl font-serif font-bold">Secure Donation Portal</h2>
                   <p class="text-[10px] text-amber-200 uppercase tracking-widest">256-Bit SSL Encrypted</p>
                </div>
             </div>
             <div class="hidden md:flex gap-4 opacity-70">
                <span class="flex items-center gap-1 text-xs"><span class="material-icons text-sm">verified_user</span> PCI-DSS Compliant</span>
                <span class="flex items-center gap-1 text-xs"><span class="material-icons text-sm">shield</span> Fraud Protection</span>
             </div>
          </div>

          <div class="p-8 relative bg-white">
            <div class="relative z-10">
              @if (templeService.siteConfig().enableHundi) {
                <!-- Payment Method Selection -->
                @if (step() === 'form') {
                  <div class="flex justify-center gap-4 mb-8 p-1 bg-stone-100 rounded-full w-fit mx-auto">
                     <button (click)="paymentMode = 'online'" [class]="paymentMode === 'online' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'" class="px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 text-sm">
                        <span class="material-icons text-sm">credit_card</span> Online Gateway
                     </button>
                     <button (click)="paymentMode = 'bank'" [class]="paymentMode === 'bank' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'" class="px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 text-sm">
                        <span class="material-icons text-sm">account_balance</span> NEFT/IMPS
                     </button>
                  </div>

                  <!-- Bank Transfer Info -->
                  @if (paymentMode === 'bank') {
                     <div class="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8 animate-fade-in">
                        <h3 class="font-bold text-blue-900 mb-4 flex items-center gap-2">
                           <span class="material-icons text-sm">info</span> Bank Account Details
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div class="space-y-2">
                               <p class="text-stone-500">Account Name</p>
                               <p class="font-bold text-stone-800 text-lg">{{ templeService.siteConfig().bankInfo?.accountName }}</p>
                            </div>
                            <div class="space-y-2">
                               <p class="text-stone-500">Account Number</p>
                               <p class="font-mono font-bold text-stone-800 text-lg">{{ templeService.siteConfig().bankInfo?.accountNumber }}</p>
                            </div>
                             <div class="space-y-2">
                               <p class="text-stone-500">IFSC Code</p>
                               <p class="font-mono font-bold text-stone-800 text-lg">{{ templeService.siteConfig().bankInfo?.ifsc }}</p>
                            </div>
                        </div>
                     </div>
                  }

                  <form (submit)="processPayment($event)" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="md:col-span-2">
                        <label class="block text-xs font-bold text-stone-500 uppercase mb-1">Purpose of Contribution</label>
                        <select [(ngModel)]="category" name="category" class="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-stone-50 font-bold text-stone-800">
                          @for(cat of templeService.siteConfig().donationCategories; track cat) {
                            <option [value]="cat">{{cat}}</option>
                          }
                        </select>
                      </div>

                      <div>
                        <label class="block text-xs font-bold text-stone-500 uppercase mb-1">Devotee Name</label>
                        <input type="text" [(ngModel)]="donorName" name="donorName" required class="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                      </div>
                      
                      <div>
                        <label class="block text-xs font-bold text-stone-500 uppercase mb-1">Gothram (Optional)</label>
                        <input type="text" [(ngModel)]="gothram" name="gothram" class="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                      </div>
                    </div>

                    <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
                      <label class="block text-sm font-bold text-amber-900 mb-3 text-center">Select Amount (INR)</label>
                      <div class="flex gap-2 justify-center mb-4 flex-wrap">
                        @for(amt of templeService.siteConfig().donationAmounts; track amt) {
                          <button type="button" (click)="amount = amt" class="px-4 py-2 rounded border border-amber-200 bg-white text-amber-900 font-bold hover:bg-amber-100 transition-colors text-sm shadow-sm">{{ amt }}</button>
                        }
                      </div>
                      <div class="relative max-w-xs mx-auto">
                         <span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xl">₹</span>
                         <input type="number" [(ngModel)]="amount" name="amount" required min="1" class="w-full pl-10 p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-2xl font-bold text-stone-800 text-center bg-white shadow-inner">
                      </div>
                    </div>

                    <div class="flex items-center gap-2 mb-4">
                       <input type="checkbox" id="tax" class="w-4 h-4 text-amber-600 rounded">
                       <label for="tax" class="text-xs text-stone-500">I want an 80G Tax Exemption Receipt</label>
                    </div>

                    <button *ngIf="paymentMode === 'online'" type="submit" class="w-full theme-bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3">
                      Proceed to Pay ₹{{amount}}
                      <span class="material-icons text-sm">arrow_forward</span>
                    </button>
                    <button *ngIf="paymentMode === 'bank'" type="button" (click)="recordOfflineDonation()" class="w-full bg-stone-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-stone-900 transform hover:-translate-y-0.5 transition-all">
                      Confirm Transfer
                    </button>
                  </form>
                } @else if (step() === 'success') {
                  <!-- Professional Receipt View -->
                  <div class="animate-fade-in bg-stone-50 rounded-xl p-8 border border-stone-200">
                    
                    <div class="bg-white border-[10px] border-double border-stone-200 p-8 rounded-none relative overflow-hidden shadow-sm max-w-lg mx-auto print:max-w-full print:border-none">
                      <!-- Watermark -->
                      <div class="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                         <img [src]="templeService.siteConfig().logoUrl" class="w-80 h-80 grayscale">
                      </div>

                      <div class="relative z-10">
                          <div class="text-center mb-6 border-b-2 border-stone-800 pb-4">
                             <h3 class="text-2xl font-serif font-bold text-stone-900 uppercase tracking-widest">{{ templeService.siteConfig().templeName }}</h3>
                             <p class="text-[10px] font-bold text-stone-500 uppercase">Registered Trust | 80G Exempt</p>
                          </div>
                          
                          <div class="flex justify-between items-start mb-8 text-xs font-mono">
                             <div>
                                <p>Receipt No: <span class="font-bold">{{ transactionId }}</span></p>
                                <p>Date: <span class="font-bold">{{ currentDate | date:'medium' }}</span></p>
                             </div>
                             <div class="text-right">
                                <p>Payment Mode: <span class="font-bold uppercase">{{ paymentMode }}</span></p>
                                <p>Status: <span class="font-bold text-green-700">SUCCESS</span></p>
                             </div>
                          </div>

                          <div class="mb-8">
                             <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">Received with thanks from</p>
                             <p class="text-xl font-bold text-stone-800 font-serif">{{ donorName }}</p>
                             @if(gothram) { <p class="text-sm text-stone-600">Gothram: {{ gothram }}</p> }
                          </div>

                          <div class="flex justify-between items-center bg-stone-100 p-4 border border-stone-200 mb-8">
                             <span class="font-bold text-stone-600 uppercase text-xs">{{ category }}</span>
                             <span class="font-bold text-2xl font-mono">₹ {{ amount | number }}/-</span>
                          </div>

                          <div class="text-center mt-8 pt-4 border-t border-stone-200 flex flex-col items-center">
                             <img src="https://picsum.photos/id/20/100/40" class="h-10 opacity-50 mb-2 grayscale" alt="Signature">
                             <p class="text-[10px] uppercase font-bold text-stone-400">Authorized Signatory</p>
                          </div>
                      </div>
                    </div>

                    <div class="mt-8 flex justify-center gap-4 print:hidden">
                       <button (click)="printReceipt()" class="bg-stone-800 text-white px-6 py-2 rounded shadow hover:bg-black flex items-center gap-2 text-sm font-bold">
                         <span class="material-icons text-sm">print</span> Print
                       </button>
                       <button (click)="reset()" class="bg-white border border-stone-300 text-stone-600 px-6 py-2 rounded hover:bg-stone-50 text-sm font-bold">New Donation</button>
                    </div>
                  </div>
                }
              } @else {
               <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                  <div class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                     <span class="material-icons text-4xl text-stone-400">savings_off</span>
                  </div>
                  <h3 class="text-2xl font-bold text-stone-700 font-serif">Service Unavailable</h3>
               </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      @if (showPaymentModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
           <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
               <div class="p-8 text-center">
                   <div class="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                   <p class="font-bold text-lg">Connecting to Secure Gateway...</p>
                   <p class="text-sm text-stone-500 mt-2">Do not close this window</p>
               </div>
           </div>
        </div>
      }
    </div>
  `
})
export class EHundiComponent {
  templeService = inject(TempleService);
  location = inject(Location);
  
  amount = this.templeService.siteConfig().donationAmounts[0] || 101;
  donorName = '';
  gothram = '';
  category = this.templeService.siteConfig().donationCategories[0] || 'General Hundi';
  pan = '';
  paymentMode: 'online' | 'bank' = 'online';
  
  step = signal<'form' | 'success'>('form');
  transactionId = '';
  currentDate = '';
  showPaymentModal = signal(false);

  goBack() {
    this.location.back();
  }

  processPayment(e: Event) {
    e.preventDefault();
    if (this.paymentMode === 'online') {
        this.showPaymentModal.set(true);
        setTimeout(() => {
            this.showPaymentModal.set(false);
            this.completeTransaction();
        }, 2000);
    } else {
        this.completeTransaction();
    }
  }

  recordOfflineDonation() { this.completeTransaction(); }

  private async completeTransaction() {
    const prefix = this.paymentMode === 'online' ? 'TXN' : 'OFF';
    this.transactionId = prefix + Math.floor(Math.random() * 10000000).toString();
    this.currentDate = new Date().toISOString();
    
    this.templeService.addDonation({
         id: Date.now().toString(),
         donorName: this.donorName,
         gothram: this.gothram,
         category: this.category,
         amount: this.amount,
         date: this.currentDate,
         transactionId: this.transactionId,
         pan: this.pan
    });
    this.step.set('success');
  }

  printReceipt() { window.print(); }
  reset() { this.step.set('form'); this.amount = 101; this.donorName = ''; }
}