import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-site-shell',
  imports: [RouterLink],
  templateUrl: './site-shell.html',
  styleUrl: './site-shell.css',
})
export class SiteShell implements AfterViewInit, OnDestroy {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly router: Router,
  ) {
    this.syncRouteState(this.router.url);

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      this.syncRouteState(event.urlAfterRedirects);
      this.resetHeaderState();
      this.closeMobileMenu();

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.updateHeaderOffset(), 0);
      }
    });
  }

  @ViewChild('topbar') private topbarRef?: ElementRef<HTMLElement>;
  @ViewChild('mainNav') private mainNavRef?: ElementRef<HTMLElement>;

  protected isHeaderHidden = false;
  protected isHomeRoute = false;
  protected isMobileMenuOpen = false;
  protected isNavScrolled = false;
  protected headerOffset = 141;

  private lastScrollY = 0;
  private readonly hideOffset = 64;
  private readonly scrollThreshold = 8;
  private readonly routerSubscription: Subscription;

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.lastScrollY = Math.max(window.scrollY || 0, 0);
    this.resetHeaderState();
    this.updateHeaderOffset();
  }

  public ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }

    this.updateHeaderOffset();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentScrollY = Math.max(window.scrollY || 0, 0);
    const scrollDelta = currentScrollY - this.lastScrollY;

    if (this.isMobileMenuOpen && currentScrollY !== this.lastScrollY) {
      this.closeMobileMenu();
    }

    this.isNavScrolled = !this.isHomeRoute || currentScrollY > 12;

    if (currentScrollY <= 0) {
      this.isHeaderHidden = false;
      this.isNavScrolled = !this.isHomeRoute;
      this.lastScrollY = 0;
      return;
    }

    if (Math.abs(scrollDelta) >= this.scrollThreshold) {
      if (scrollDelta > 0 && currentScrollY > this.hideOffset) {
        this.isHeaderHidden = true;
      } else if (scrollDelta < 0) {
        this.isHeaderHidden = false;
      }
    }

    this.lastScrollY = currentScrollY;
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private syncRouteState(url: string): void {
    const currentPath = url.split('?')[0].split('#')[0];
    this.isHomeRoute = currentPath === '' || currentPath === '/';
  }

  private resetHeaderState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isHeaderHidden = false;
      this.isNavScrolled = !this.isHomeRoute;
      return;
    }

    this.lastScrollY = Math.max(window.scrollY || 0, 0);
    this.isHeaderHidden = false;
    this.isNavScrolled = !this.isHomeRoute || this.lastScrollY > 12;
  }

  private updateHeaderOffset(): void {
    const topbarHeight = this.topbarRef?.nativeElement.offsetHeight ?? 0;
    const mainNavHeight = this.mainNavRef?.nativeElement.offsetHeight ?? 0;

    this.headerOffset = topbarHeight + mainNavHeight;
  }
}
