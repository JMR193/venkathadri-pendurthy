import { Component, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 flex flex-col border border-stone-200 overflow-hidden transition-all duration-300 transform origin-bottom-right h-[500px]">
          <!-- Header -->
          <div class="bg-orange-600 text-white p-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="material-icons text-xl">psychology</span>
              <h3 class="font-serif font-bold">AI Digital Sahayak</h3>
            </div>
            <button (click)="toggleChat()" class="hover:bg-orange-700 p-1 rounded">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 bg-stone-50 space-y-4" #scrollContainer>
            @for (msg of messages(); track msg.id) {
              <div [class]="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
                <div [class]="msg.sender === 'user' ? 'bg-orange-100 text-orange-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'" class="p-3 max-w-[85%] text-sm shadow-sm">
                  {{ msg.text }}
                </div>
              </div>
            }
            @if (isLoading()) {
              <div class="flex justify-start">
                <div class="bg-white border border-stone-200 p-3 rounded-2xl shadow-sm">
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></div>
                    <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Input -->
          <div class="p-3 bg-white border-t border-stone-200 flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="currentInput" 
              (keyup.enter)="sendMessage()"
              placeholder="Ask about darshan timings..." 
              class="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button (click)="sendMessage()" [disabled]="!currentInput || isLoading()" class="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center w-10 h-10">
              <span class="material-icons text-sm">send</span>
            </button>
          </div>
        </div>
      }

      <!-- Toggle Button -->
      <button (click)="toggleChat()" class="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
        <span class="material-icons text-2xl group-hover:rotate-12 transition-transform">smart_toy</span>
        @if (!isOpen()) {
          <span class="font-bold pr-2">Ask Sahayak</span>
        }
      </button>

    </div>
  `
})
export class AiChatComponent implements AfterViewChecked {
  private aiService = inject(AiService);
  
  isOpen = signal(false);
  isLoading = signal(false);
  currentInput = '';
  messages = signal<{id: number, text: string, sender: 'user' | 'bot'}[]>([
    { id: 1, text: "Namaste! I am your AI Sahayak. How can I assist you today?", sender: 'bot' }
  ]);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    if (!this.currentInput.trim()) return;

    const userMsg = this.currentInput;
    this.currentInput = '';
    
    this.messages.update(msgs => [...msgs, { id: Date.now(), text: userMsg, sender: 'user' }]);
    this.isLoading.set(true);

    const response = await this.aiService.generateResponse(userMsg);
    
    this.messages.update(msgs => [...msgs, { id: Date.now() + 1, text: response, sender: 'bot' }]);
    this.isLoading.set(false);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }
  }
}