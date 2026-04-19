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
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  @ViewChild('heroVideo') private heroVideoRef?: ElementRef<HTMLVideoElement>;

  protected isNavHidden = false;
  protected isNavPinnedToTop = false;
  protected isNavScrolled = false;

  private lastScrollY = 0;
  private readonly topbarHeight = 40;
  private readonly scrollThreshold = 8;
  private retryPlayTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initializeHeroVideo();
  }

  public ngOnDestroy(): void {
    const video = this.getPlayableVideoElement();

    if (video) {
      video.removeEventListener('canplay', this.ensureHeroVideoPlayback);
      video.removeEventListener('loadeddata', this.ensureHeroVideoPlayback);
    }

    if (this.retryPlayTimeoutId) {
      clearTimeout(this.retryPlayTimeoutId);
      this.retryPlayTimeoutId = null;
    }
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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

  @HostListener('document:visibilitychange')
  protected onVisibilityChange(): void {
    if (isPlatformBrowser(this.platformId) && document.visibilityState === 'visible') {
      this.ensureHeroVideoPlayback();
    }
  }

  private initializeHeroVideo(): void {
    const video = this.getPlayableVideoElement();

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.preload = 'auto';

    video.load();
    this.ensureHeroVideoPlayback();

    video.addEventListener('canplay', this.ensureHeroVideoPlayback);
    video.addEventListener('loadeddata', this.ensureHeroVideoPlayback);
  }

  private ensureHeroVideoPlayback = (): void => {
    const video = this.getPlayableVideoElement();

    if (!video || !isPlatformBrowser(this.platformId) || document.visibilityState === 'hidden') {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const playAttempt = video.play();

    if (!playAttempt) {
      return;
    }

    playAttempt.catch(() => {
      if (this.retryPlayTimeoutId) {
        clearTimeout(this.retryPlayTimeoutId);
      }

      this.retryPlayTimeoutId = setTimeout(() => {
        this.retryPlayTimeoutId = null;
        this.ensureHeroVideoPlayback();
      }, 300);
    });
  };

  private getPlayableVideoElement(): HTMLVideoElement | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const video = this.heroVideoRef?.nativeElement as Partial<HTMLVideoElement> | undefined;

    if (!video || typeof video.load !== 'function' || typeof video.play !== 'function') {
      return null;
    }

    return video as HTMLVideoElement;
  }
}
