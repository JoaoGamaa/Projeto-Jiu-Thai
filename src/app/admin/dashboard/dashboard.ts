import { Component } from '@angular/core';
import { SiteShell } from '../../public/components/site-shell/site-shell';

@Component({
  selector: 'app-admin-dashboard',
  imports: [SiteShell],
  template: `
    <app-site-shell>
      <main class="admin-dashboard-page">
        <section class="admin-dashboard-card">
          <p>Painel administrativo</p>
          <h1>Dashboard em construção</h1>
        </section>
      </main>
    </app-site-shell>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-dashboard-page {
      align-items: center;
      background: #080808;
      color: #fff;
      display: grid;
      font-family: 'Montserrat', Arial, sans-serif;
      justify-content: center;
      min-height: calc(100svh - 141px);
      padding: 3rem 1rem;
    }

    .admin-dashboard-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      max-width: 520px;
      padding: 2rem;
      text-align: center;
      width: min(100%, 520px);
    }

    .admin-dashboard-card p {
      color: #f7c321;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      margin: 0 0 0.75rem;
      text-transform: uppercase;
    }

    .admin-dashboard-card h1 {
      font-size: clamp(1.6rem, 5vw, 2.2rem);
      margin: 0;
    }
  `,
})
export class AdminDashboard {}
