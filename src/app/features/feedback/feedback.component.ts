import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TempleService } from '../../core/services/temple.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-amber-50 py-12 min-h-screen flex items-center justify-center relative">
      <!-- Back Button -->
      <button (click)="goBack()" class="absolute top-4 left-4 flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-bold text-sm z-10">
         <span class="material-icons text-sm">arrow_back</span> Back
      </button>

      <div class="container mx-auto px-4 mt-4">
        <div class="max-w-xl mx-auto bg-white themed-rounded-lg shadow-xl overflow-hidden">
          <div class="bg-stone-800 p-6 text-white text-center">
            <h2 class="text-2xl font-serif font-bold">Devotee Feedback</h2>
            <p class="text-sm opacity-75">Help us improve the temple services</p>
          </div>
          
          <div class="p-8">
            @if (!submitted()) {
              <form (submit)="handleSubmit($event)">
                <div class="mb-4">
                  <label class="block text-stone-700 font-bold mb-2">Your Name</label>
                  <input [(ngModel)]="name" name="name" required class="w-full px-4 py-2 border border-stone-300 themed-rounded focus:border-amber-500 focus:outline-none" placeholder="Enter Name">
                </div>
                
                <div class="mb-6">
                   <label class="block text-stone-700 font-bold mb-2">Feedback / Suggestion</label>
                   <textarea [(ngModel)]="message" name="message" required class="w-full px-4 py-2 border border-stone-300 themed-rounded h-32 resize-none focus:border-amber-500 focus:outline-none" placeholder="Share your experience..."></textarea>
                </div>

                <button type="submit" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 themed-rounded transition-colors shadow">
                  Submit Feedback
                </button>
              </form>
            } @else {
              <div class="text-center py-8">
                <div class="text-5xl mb-4">🙏</div>
                <h3 class="text-2xl font-bold text-stone-800 mb-2">Thank You!</h3>
                <p class="text-stone-600 mb-6">Your feedback has been recorded.</p>
                <button (click)="reset()" class="text-amber-700 font-bold hover:underline">Submit Another</button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeedbackComponent {
  templeService = inject(TempleService);
  location = inject(Location);
  name = '';
  message = '';
  submitted = signal(false);

  goBack() {
    this.location.back();
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    if (this.name && this.message) {
      this.templeService.addFeedback(this.name, this.message);
      this.submitted.set(true);
    }
  }

  reset() {
    this.name = '';
    this.message = '';
    this.submitted.set(false);
  }
}