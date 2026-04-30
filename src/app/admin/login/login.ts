import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SiteShell } from '../../public/components/site-shell/site-shell';

const ADMIN_PASSWORD = 'admin123';
const WEBMAIL_URL = 'https://webmail.seudominio.com.br';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, SiteShell],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  protected readonly webmailUrl = WEBMAIL_URL;
  protected errorMessage = '';

  protected readonly loginForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    /**
     * Root-cause fix for the panel-jump bug.
     *
     * When a password input receives focus the browser tries to scroll it
     * into view. That scroll can happen on document.body, document.documentElement,
     * or an ancestor element — not necessarily on window — so window.scrollTo()
     * had no effect as a counter-measure.
     *
     * The login page is a single full-screen card that never needs scrolling.
     * Locking body overflow while this component is alive prevents any
     * focus-triggered scroll from occurring in the first place.
     */
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Restore scroll behaviour when leaving the login page.
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  protected validatePasswordField(): void {
    const password = this.loginForm.controls.password.value.trim();

    if (!password) {
      this.errorMessage = 'Digite a senha para continuar.';
    }
  }

  protected clearPasswordErrorOnInput(): void {
    const password = this.loginForm.controls.password.value.trim();

    if (password && this.errorMessage === 'Digite a senha para continuar.') {
      this.errorMessage = '';
    }
  }

  protected submitLogin(): void {
    const password = this.loginForm.controls.password.value.trim();

    if (!password) {
      this.errorMessage = 'Digite a senha para continuar.';
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      this.errorMessage = 'Senha incorreta. Tente novamente.';
      return;
    }

    this.errorMessage = '';
    void this.router.navigate(['/admin/dashboard']);
  }
}