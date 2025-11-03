import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { RouterModule } from '@angular/router';
import { EcomService } from '../../core/services/ecom.service';

@Component({
  selector: 'app-my-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-cart.component.html',
  styleUrl: './my-cart.component.scss'
})
export class MyCartComponent implements OnInit {
  cartItems: any[] = [];
  total = 0;
  loading = false;

  constructor(private ecomService: EcomService) {}

  ngOnInit(): void {
    this.fetchCart();
  }

  fetchCart() {
    this.loading = true;
    this.ecomService.getCart().subscribe({
      next: (res: any) => {
        this.cartItems = res.items || [];
        this.total = res.total || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Cart fetch error:', err);
        this.loading = false;
      }
    });
  }

  increaseQty(item: any) {
    item.quantity++;
    this.updateTotal();
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateTotal();
    }
  }

  removeItem(item: any) {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.updateTotal();
  }

  updateTotal() {
    this.total = this.cartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  }
}