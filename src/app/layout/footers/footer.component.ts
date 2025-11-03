import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  brand = {
    name: 'Auralis Luxe',
    tagline: 'Timeless elegance. Crafted for you.',
    year: new Date().getFullYear(),
  };

  socialLinks = [
    { icon: 'fab fa-instagram', url: 'https://instagram.com/auralisluxe' },
    { icon: 'fab fa-facebook', url: 'https://facebook.com/auralisluxe' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com/auralisluxe' },
  ];
}
