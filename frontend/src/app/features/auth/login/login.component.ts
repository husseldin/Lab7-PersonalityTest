import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<div class="auth-container"><h2>Login Component</h2><p>TODO: Implement login form</p></div>`
})
export class LoginComponent {}
