import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="home-container">
      <header class="hero">
        <h1>Discover Your Personality Type</h1>
        <p class="subtitle">Take our MBTI-inspired assessment to understand your strengths, preferences, and potential</p>
        <div class="cta-buttons">
          <a mat-raised-button color="primary" routerLink="/test" class="btn-large">
            Start Free Test
          </a>
          <a mat-button routerLink="/auth/login">
            Sign In
          </a>
        </div>
      </header>

      <section class="features">
        <div class="container">
          <div class="feature-grid">
            <div class="feature-card">
              <mat-icon>psychology</mat-icon>
              <h3>60 Scientific Questions</h3>
              <p>Carefully crafted questions balanced across all personality dimensions</p>
            </div>
            <div class="feature-card">
              <mat-icon>analytics</mat-icon>
              <h3>Detailed Analysis</h3>
              <p>Get insights into your strengths, communication style, and career preferences</p>
            </div>
            <div class="feature-card">
              <mat-icon>people</mat-icon>
              <h3>Compare with Friends</h3>
              <p>Invite friends and compare your personality profiles</p>
            </div>
            <div class="feature-card">
              <mat-icon>download</mat-icon>
              <h3>PDF Reports</h3>
              <p>Download professional reports to share with employers or coaches</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="disclaimer">
        <p><strong>Disclaimer:</strong> This tool provides an MBTI-inspired personality assessment and is not affiliated with, endorsed by, or connected to The Myers-Briggs Company.</p>
      </footer>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
    }

    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
    }

    .btn-large {
      padding: 0.75rem 2rem !important;
      font-size: 1.1rem !important;
    }

    .features {
      padding: 4rem 2rem;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      text-align: center;
      padding: 2rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .feature-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .disclaimer {
      text-align: center;
      padding: 2rem;
      background: #f5f5f5;
      font-size: 0.875rem;
      color: #666;
    }
  `]
})
export class HomeComponent {}
