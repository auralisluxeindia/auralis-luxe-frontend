import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-azl-post-login',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './azl-post-login.component.html',
  styleUrl: './azl-post-login.component.scss'
})
export class AzlPostLoginComponent {
  user = JSON.parse(localStorage.getItem('azl_user') || 'null');
}
