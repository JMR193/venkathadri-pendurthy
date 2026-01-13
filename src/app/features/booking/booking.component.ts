import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TempleService, SevaType } from '../../core/services/temple.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      @if (templeService.siteConfig().enableBooking) {
        <div class="max-w-4xl mx-auto">
          
          <div class="text-center mb-12">
            <h2 class="text-3xl font-serif font-bold theme-text-primary">Seva Booking Portal</h2>
            <p class="mt-2 text-stone-600">Secure your slot for Darshan and Arjitha Sevas</p>
          </div>

          <div class="bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row border border-stone-200">
            
            <!-- Left: Seva Info Panel -->
            <div class="theme-bg-primary p-8 md:w-1/3 text-amber-50 flex flex-col justify-between relative overflow-hidden bg-stone-900">
              <!-- Decorative circle -->
              <div class="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/5"></div>
              
              <div class="relative z-10">
                <h3 class="text-xl font-serif font-bold mb-6 text-amber-400 border-b border-white/10 pb-4">Seva Tariffs</h3>
                <ul class="space-y-4 text-sm">
                  @for (seva of templeService.availableSevas(); track seva.id) {
                    <li class="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors" (click)="setSeva(seva)">
                      <div>
                        <span class="block font-bold text-white group-hover:text-amber-300">{{ seva.name }}</span>
                        <span class="text-xs opacity-60">{{ seva.description }}</span>
                      </div>
                      <span class="font-mono font-bold text-lg">₹{{ seva.price }}</span>
                    </li>
                  }
                </ul>
              </div>
              
              <div class="mt-8 relative z-10 text-xs opacity-60">
                <p>Om Namo Venkatesaya</p>
                <p class="mt-1">All bookings are final and non-refundable.</p>
              </div>
            </div>

            <!-- Right: Form Section -->
            <div class="p-8 md:w-2/3 bg-white relative">
              @if (successMessage()) {
                <div class="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                     <span class="material-icons text-4xl text-green-600">verified</span>
                  </div>
                  <h3 class="font-bold text-2xl mb-2 text-stone-800">Booking Confirmed!</h3>
                  <p class="text-stone-500 mb-8 max-w-xs mx-auto">Your ticket (Ref: <span class="font-mono font-bold text-stone-800">BK-{{lastBookingDetails?.date | date:'dd'}}-{{(Math.random()*1000).toFixed(0)}}</span>) has been sent to WhatsApp.</p>
                  
                  <div class="bg-stone-50 p-4 rounded-lg border border-stone-200 w-full max-w-sm text-left text-sm mb-6">
                    <div class="flex justify-between mb-2"><span class="text-stone-500">Devotee</span> <span class="font-bold">{{ lastBookingDetails?.name }}</span></div>
                    <div class="flex justify-between mb-2"><span class="text-stone-500">Seva</span> <span class="font-bold">{{ lastBookingDetails?.type }}</span></div>
                    <div class="flex justify-between"><span class="text-stone-500">Date</span> <span class="font-bold">{{ lastBookingDetails?.date }}</span></div>
                  </div>

                  <button (click)="resetForm()" class="text-amber-700 font-bold hover:underline">Book Another</button>
                </div>
              } @else if (showPayment()) {
                <!-- Payment Gateway Simulation -->
                <div class="animate-fade-in h-full flex flex-col">
                   <div class="flex items-center gap-4 mb-6">
                      <button (click)="showPayment.set(false)" class="p-2 hover:bg-stone-100 rounded-full transition-colors">
                         <span class="material-icons text-stone-500">arrow_back</span>
                      </button>
                      <div>
                         <h3 class="text-lg font-bold text-stone-800">Secure Payment</h3>
                         <p class="text-xs text-stone-500">Encrypted via 256-bit SSL</p>
                      </div>
                   </div>
                   
                   <div class="bg-gradient-to-r from-stone-100 to-white p-6 rounded-xl border border-stone-200 mb-6">
                     <p class="text-xs text-stone-500 uppercase tracking-widest font-bold mb-1">Total Payable</p>
                     <p class="text-3xl font-bold text-stone-900">₹{{ getAmount() }}<span class="text-lg font-normal text-stone-400">.00</span></p>
                   </div>

                   <div class="space-y-3 flex-grow">
                     <button (click)="processPayment('UPI')" class="w-full flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all group bg-white">
                       <div class="flex items-center gap-4">
                         <div class="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center"><span class="material-icons text-stone-500 group-hover:text-amber-600">qr_code_2</span></div>
                         <div class="text-left">
                            <span class="block font-bold text-stone-700">UPI / QR Code</span>
                            <span class="text-xs text-stone-400">GPay, PhonePe, Paytm</span>
                         </div>
                       </div>
                       <span class="material-icons text-stone-300">chevron_right</span>
                     </button>
                     <button (click)="processPayment('Card')" class="w-full flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all group bg-white">
                       <div class="flex items-center gap-4">
                         <div class="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center"><span class="material-icons text-stone-500 group-hover:text-amber-600">credit_card</span></div>
                         <div class="text-left">
                            <span class="block font-bold text-stone-700">Credit / Debit Card</span>
                            <span class="text-xs text-stone-400">Visa, Mastercard, Rupay</span>
                         </div>
                       </div>
                       <span class="material-icons text-stone-300">chevron_right</span>
                     </button>
                   </div>

                   @if (isProcessing()) {
                     <div class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                       <div class="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                       <span class="text-sm font-bold text-stone-600 tracking-wide">Processing Secure Payment...</span>
                     </div>
                   }
                </div>
              } @else {
                <!-- Booking Form -->
                <form [formGroup]="bookingForm" (ngSubmit)="initiatePayment()" class="space-y-6 h-full flex flex-col justify-center">
                  <h3 class="text-lg font-bold text-stone-800 mb-2">Devotee Details</h3>
                  
                  <div class="relative">
                    <input type="text" formControlName="name" id="name" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-stone-900 bg-transparent rounded-lg border-1 border-stone-300 appearance-none focus:outline-none focus:ring-0 focus:border-amber-600 peer border" placeholder=" " />
                    <label for="name" class="absolute text-sm text-stone-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-amber-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Full Name</label>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="relative">
                       <select formControlName="type" id="type" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-stone-900 bg-transparent rounded-lg border-1 border-stone-300 appearance-none focus:outline-none focus:ring-0 focus:border-amber-600 peer border">
                        @for(seva of templeService.availableSevas(); track seva.id) {
                          <option [value]="seva.name">{{ seva.name }} (₹{{ seva.price }})</option>
                        }
                      </select>
                      <label for="type" class="absolute text-sm text-stone-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-amber-600 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Seva Type</label>
                    </div>
                    <div class="relative">
                      <input type="date" formControlName="date" id="date" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-stone-900 bg-transparent rounded-lg border-1 border-stone-300 appearance-none focus:outline-none focus:ring-0 focus:border-amber-600 peer border" placeholder=" " />
                      <label for="date" class="absolute text-sm text-stone-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-amber-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Date</label>
                    </div>
                  </div>

                  <div class="relative">
                    <input type="tel" formControlName="phone" id="phone" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-stone-900 bg-transparent rounded-lg border-1 border-stone-300 appearance-none focus:outline-none focus:ring-0 focus:border-amber-600 peer border" placeholder=" " />
                    <label for="phone" class="absolute text-sm text-stone-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-amber-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">WhatsApp Number</label>
                  </div>

                  <div class="pt-4 mt-auto">
                    <button type="submit" [disabled]="bookingForm.invalid" class="w-full theme-bg-primary bg-[#800000] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 group">
                      <span>Continue to Payment</span>
                      <span class="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <p class="text-center text-[10px] text-stone-400 mt-3">By booking, you agree to the temple dress code.</p>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center h-[60vh] text-center">
           <div class="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mb-6">
              <span class="material-icons text-5xl text-stone-400">event_busy</span>
           </div>
           <h2 class="text-3xl font-serif font-bold text-stone-700">Bookings Paused</h2>
           <p class="text-stone-500 mt-2 max-w-md">Online booking services are currently unavailable. Please visit the temple counter or try again later.</p>
        </div>
      }
    </div>
  `
})
export class BookingComponent {
  private fb = inject(FormBuilder);
  templeService = inject(TempleService);
  
  successMessage = signal(false);
  showPayment = signal(false);
  isProcessing = signal(false);
  lastBookingDetails: any = null;
  Math = Math;

  bookingForm = this.fb.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    date: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });
  
  constructor() {
    // Set default if available
    const sevas = this.templeService.availableSevas();
    if (sevas.length > 0) {
      this.bookingForm.patchValue({ type: sevas[0].name });
    }
  }

  setSeva(seva: SevaType) {
    this.bookingForm.patchValue({ type: seva.name });
  }

  getAmount(): number {
    const typeName = this.bookingForm.get('type')?.value;
    const seva = this.templeService.availableSevas().find(s => s.name === typeName);
    return seva ? seva.price : 0;
  }

  initiatePayment() {
    if (this.bookingForm.valid) {
      this.showPayment.set(true);
    }
  }

  processPayment(method: string) {
    this.isProcessing.set(true);
    
    // Simulate Gateway Delay
    setTimeout(() => {
      const val = this.bookingForm.value;
      const amount = this.getAmount();

      this.templeService.addBooking({
        name: val.name!,
        type: val.type as any,
        date: val.date!,
        amount: amount
      });

      this.lastBookingDetails = val;
      this.isProcessing.set(false);
      this.showPayment.set(false);
      this.successMessage.set(true);
      
    }, 2500);
  }

  resetForm() {
      this.successMessage.set(false);
      const sevas = this.templeService.availableSevas();
      this.bookingForm.reset({ type: sevas.length ? sevas[0].name : '' });
  }
}