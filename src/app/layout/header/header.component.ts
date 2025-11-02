import { Component, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  searchQuery = '';
  placeholderSuggestions = [
    'Shop for Earrings',
    'Shop for Necklaces',
    'Find the best gift for anniversary',
    'Shop Pendants',
    'Explore New Arrivals'
  ];
  placeholderIndex = 0;
  placeholder = this.placeholderSuggestions[this.placeholderIndex];
  private placeholderTimer!: ReturnType<typeof setInterval>;

  mobileMenuOpen = false;
  searchFocused = false;
  suggestionOpen = false;

  openMega: string | null = null;

  wishlistCount = 3;
  cartCount = 2;

  constructor() {
    this.startPlaceholderRotation();
  }

  startPlaceholderRotation() {
    this.placeholderTimer = setInterval(() => {
      this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholderSuggestions.length;
      this.placeholder = this.placeholderSuggestions[this.placeholderIndex];
    }, 3000);
  }

  stopPlaceholderRotation() {
    clearInterval(this.placeholderTimer);
  }

  onSearchFocus() {
    this.searchFocused = true;
    this.suggestionOpen = !!this.searchQuery;
    this.stopPlaceholderRotation();
  }

  onSearchBlur() {
    setTimeout(() => {
      this.searchFocused = false;
      this.suggestionOpen = false;
      this.startPlaceholderRotation();
    }, 200);
  }

  onSearchInput() {
    this.suggestionOpen = this.searchQuery.length > 0;
  }

  chooseSuggestion(s: string) {
    this.searchQuery = s;
    this.suggestionOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  openMegaMenu(key: string | null) {
    this.openMega = key;
  }

  closeMegaMenu() {
    this.openMega = null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape() {
    this.mobileMenuOpen = false;
    this.openMega = null;
    this.suggestionOpen = false;
  }

  ngOnDestroy(): void {
    this.stopPlaceholderRotation();
  }

  startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Voice recognition not supported in this browser.');
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log('Listening...');
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log('User said:', transcript);
    this.searchQuery = transcript;
  };

  recognition.onerror = (event: any) => {
    console.error('Speech error:', event.error);
  };

  recognition.start();
}

}