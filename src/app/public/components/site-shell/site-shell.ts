import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-shell',
  imports: [RouterLink],
  templateUrl: './site-shell.html',
  styleUrl: './site-shell.css',
})
export class SiteShell {
  protected isNavHidden = false;
  protected isNavPinnedToTop = false;
  protected isNavScrolled = false;

  private lastScrollY = 0;
  private readonly topbarHeight = 40;
  private readonly scrollThreshold = 8;

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    const currentScrollY = Math.max(window.scrollY || 0, 0);
    const scrollDelta = currentScrollY - this.lastScrollY;

    this.isNavScrolled = currentScrollY > 0;
    this.isNavPinnedToTop = currentScrollY > this.topbarHeight;

    if (currentScrollY <= 0) {
      this.isNavHidden = false;
      this.isNavPinnedToTop = false;
      this.isNavScrolled = false;
      this.lastScrollY = 0;
      return;
    }

    if (Math.abs(scrollDelta) < this.scrollThreshold) {
      return;
    }

    if (scrollDelta > 0 && currentScrollY > this.topbarHeight) {
      this.isNavHidden = true;
    } else if (scrollDelta < 0 && this.isNavHidden) {
      this.isNavHidden = false;
    }

    this.lastScrollY = currentScrollY;
  }
}
