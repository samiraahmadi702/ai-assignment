import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/">Invoice Generator</a>
      </div>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
        <a routerLink="/invoices/new" routerLinkActive="active">New Invoice</a>
        <a routerLink="/clients" routerLinkActive="active">Clients</a>
      </div>
    </nav>
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      background: #1a1a2e;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .nav-brand a {
      color: #fff;
      font-size: 1.25rem;
      font-weight: 700;
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: #a0a0b0;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-links a:hover,
    .nav-links a.active {
      color: #fff;
      border-bottom-color: #4361ee;
    }
    .container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
  `]
})
export class AppComponent {}
