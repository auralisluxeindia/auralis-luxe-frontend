import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
   @Input() user: any;
  isAdmin = false;
  isSuperAdmin = false;
  permissions: string[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.user) {
      this.isAdmin = this.user.role === 'admin';
      this.isSuperAdmin = this.user.role === 'super_admin';
      this.permissions = this.user.permissions || [];
    }
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }

  getBadgeClasses() {
    if (this.isSuperAdmin) return 'bg-yellow-500 text-white';
    if (this.isAdmin) return 'bg-gray-400 text-white';
    return 'bg-pink-300 text-white';
  }

  getCardClasses() {
    if (this.isSuperAdmin) return 'bg-yellow-50 border-yellow-400';
    if (this.isAdmin) return 'bg-gray-100 border-gray-300';
    return 'bg-pink-50 border-pink-300';
  }
}
