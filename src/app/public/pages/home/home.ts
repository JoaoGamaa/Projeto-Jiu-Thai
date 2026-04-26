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
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SiteShell],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  @ViewChild('heroVideo') private heroVideoRef?: ElementRef<HTMLVideoElement>;

  private retryPlayTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private retryPlayAttempts = 0;
  private readonly maxRetryPlayAttempts = 8;

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initializeHeroVideo();
  }

  public ngOnDestroy(): void {
    const video = this.getPlayableVideoElement();

    if (video) {
      video.removeEventListener('loadedmetadata', this.ensureHeroVideoPlayback);
      video.removeEventListener('canplay', this.ensureHeroVideoPlayback);
      video.removeEventListener('loadeddata', this.ensureHeroVideoPlayback);
      video.removeEventListener('pause', this.handleHeroVideoInterruption);
      video.removeEventListener('ended', this.handleHeroVideoInterruption);
      video.removeEventListener('stalled', this.handleHeroVideoInterruption);
      video.removeEventListener('suspend', this.handleHeroVideoInterruption);
    }

    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('touchstart', this.ensureHeroVideoPlayback);
      document.removeEventListener('pointerdown', this.ensureHeroVideoPlayback);
      window.removeEventListener('scroll', this.ensureHeroVideoPlayback);
    }

    if (this.retryPlayTimeoutId) {
      clearTimeout(this.retryPlayTimeoutId);
      this.retryPlayTimeoutId = null;
    }
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
    video.autoplay = true;
    video.loop = true;
    video.volume = 0;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');

    video.addEventListener('loadedmetadata', this.ensureHeroVideoPlayback);
    video.addEventListener('canplay', this.ensureHeroVideoPlayback);
    video.addEventListener('loadeddata', this.ensureHeroVideoPlayback);
    video.addEventListener('pause', this.handleHeroVideoInterruption);
    video.addEventListener('ended', this.handleHeroVideoInterruption);
    video.addEventListener('stalled', this.handleHeroVideoInterruption);
    video.addEventListener('suspend', this.handleHeroVideoInterruption);

    document.addEventListener('touchstart', this.ensureHeroVideoPlayback, { passive: true });
    document.addEventListener('pointerdown', this.ensureHeroVideoPlayback, { passive: true });
    window.addEventListener('scroll', this.ensureHeroVideoPlayback, { passive: true });

    video.load();
    requestAnimationFrame(this.ensureHeroVideoPlayback);
  }

  private ensureHeroVideoPlayback = (): void => {
    const video = this.getPlayableVideoElement();

    if (!video || !isPlatformBrowser(this.platformId) || document.visibilityState === 'hidden') {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const playAttempt = video.play();

    if (!playAttempt) {
      return;
    }

    playAttempt
      .then(() => {
        this.retryPlayAttempts = 0;
      })
      .catch(() => {
        this.scheduleHeroVideoRetry();
      });
  };

  private handleHeroVideoInterruption = (): void => {
    const video = this.getPlayableVideoElement();

    if (!video || !isPlatformBrowser(this.platformId)) {
      return;
    }

    video.loop = true;

    if (video.ended) {
      video.currentTime = 0;
    }

    if (document.visibilityState === 'visible') {
      this.scheduleHeroVideoRetry();
    }
  };

  private scheduleHeroVideoRetry(): void {
    if (this.retryPlayAttempts >= this.maxRetryPlayAttempts) {
      return;
    }

    this.retryPlayAttempts += 1;

    if (this.retryPlayTimeoutId) {
      clearTimeout(this.retryPlayTimeoutId);
    }

    this.retryPlayTimeoutId = setTimeout(() => {
      this.retryPlayTimeoutId = null;
      this.ensureHeroVideoPlayback();
    }, 300);
  }

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
