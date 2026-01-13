import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TempleService } from '../../core/services/temple.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-stone-50 py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16 animate-fade-in-up">
             <h1 class="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">The Sacred History</h1>
             <p class="text-xl text-stone-600 italic font-serif">"The Tirupati of North Andhra"</p>
        </div>

        <div class="flex flex-col md:flex-row gap-12 mb-16">
            <div class="md:w-3/5">
              <h2 class="text-3xl font-serif font-bold text-stone-900 mb-6 relative inline-block">
                Venkatadri Kshetram
                <span class="absolute bottom-0 left-0 w-1/2 h-1 bg-orange-500"></span>
              </h2>
              <p class="text-stone-600 mb-6 leading-relaxed text-lg whitespace-pre-wrap">
                {{ templeService.siteConfig().historyContent }}
              </p>
              
              <h3 class="text-2xl font-serif font-bold text-stone-800 mb-4">The Legend & Sthala Purana</h3>
              <p class="text-stone-600 mb-6 leading-relaxed">
                According to the local Sthala Purana, the connection between this hill and the divine is profound. It is believed that <strong>Sri Varaha Lakshmi Narasimha Swamy of Simhachalam</strong> placed one foot on the Pendurthi Venkatadri hill and the other on Simhachalam.
              </p>
              <div class="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 rounded-r-lg shadow-sm">
                 <p class="text-orange-900 font-medium italic text-lg">"The Divine Step: To this day, the divine footprint of the Lord remains etched upon this hill, serving as a powerful site of pilgrimage."</p>
              </div>

              <h3 class="text-2xl font-serif font-bold text-stone-800 mb-4">The Vision</h3>
              <p class="text-stone-600 leading-relaxed mb-6">
                Recognizing the spiritual energy of the site, local elders sought the guidance of spiritual leader <strong>Sri Tridandi Srimannarayana Chinna Jeeyar Swamy</strong>. Upon visiting the hill, Swamiji prophesied that this site would become known as the "Uttarandhra Tirupati".
              </p>

              <h3 class="text-2xl font-serif font-bold text-stone-800 mb-4">Sub Shrines</h3>
               <p class="text-stone-600 mb-4">Under the continued blessings of Swamiji, several other shrines were established at the foot of the hill:</p>
               <ul class="space-y-3 mb-6">
                 <li class="flex items-center gap-3 text-stone-700 bg-white p-3 rounded shadow-sm"><span class="material-icons text-orange-500">temple_hindu</span> Goddess Alivelu Mangamma Temple</li>
                 <li class="flex items-center gap-3 text-stone-700 bg-white p-3 rounded shadow-sm"><span class="material-icons text-orange-500">temple_hindu</span> Sri Govindaraja Swamy Temple</li>
                 <li class="flex items-center gap-3 text-stone-700 bg-white p-3 rounded shadow-sm"><span class="material-icons text-orange-500">temple_hindu</span> Sri Kalyana Venkateswara Swamy Temple</li>
               </ul>
            </div>

            <!-- Side Image -->
            <div class="md:w-2/5">
              <div class="sticky top-24">
                <div class="relative mb-8">
                    <div class="absolute inset-0 bg-orange-200 rounded-lg transform translate-x-4 translate-y-4"></div>
                    <img [src]="templeService.siteConfig().historyImageUrl" class="relative rounded-lg shadow-2xl w-full h-auto object-cover" alt="Temple History">
                </div>
                
                <div class="bg-stone-900 text-orange-50 p-6 rounded-xl shadow-xl">
                   <h3 class="font-serif font-bold text-xl mb-4 border-b border-orange-500/30 pb-2">Living Tradition</h3>
                    <p class="text-sm leading-relaxed opacity-90">
                     Venkatadri is uniquely famous for its observance of <strong>Dhanurmasam</strong>, where thousands gather daily for mass recitation of the "Tiruppavai". This collective spiritual exercise is a grand spectacle of faith.
                   </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-white rounded-2xl p-8 mb-16 shadow-lg border border-stone-100">
            <h3 class="text-2xl font-serif font-bold text-center text-stone-900 mb-8">Temple Timeline</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-stone-500 text-sm uppercase tracking-wider border-b border-stone-200">
                    <th class="p-4">Milestone</th>
                    <th class="p-4">Date</th>
                    <th class="p-4">Details</th>
                  </tr>
                </thead>
                <tbody class="text-stone-700">
                  <tr class="border-b border-stone-200 hover:bg-stone-50 transition-colors">
                    <td class="p-4 font-bold">Foundation Stone</td>
                    <td class="p-4">1995</td>
                    <td class="p-4">Laid by Sri Chinna Jeeyar Swamy.</td>
                  </tr>
                  <tr class="border-b border-stone-200 hover:bg-stone-50 transition-colors">
                    <td class="p-4 font-bold">Consecration (Pratishta)</td>
                    <td class="p-4">May 17, 1997</td>
                    <td class="p-4">Formal idol installation and sanctification.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  `
})
export class HistoryComponent {
    templeService = inject(TempleService);
}