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
    video.setAttribute('webkit-playsinline', 'true');
    this.ensureHeroVideoPlayback();

    video.addEventListener('loadedmetadata', this.ensureHeroVideoPlayback);
    video.addEventListener('canplay', this.ensureHeroVideoPlayback);
    video.addEventListener('loadeddata', this.ensureHeroVideoPlayback);
    video.addEventListener('pause', this.handleHeroVideoInterruption);
    video.addEventListener('ended', this.handleHeroVideoInterruption);
    video.addEventListener('stalled', this.handleHeroVideoInterruption);
    video.addEventListener('suspend', this.handleHeroVideoInterruption);
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
    if (this.retryPlayTimeoutId) {
      clearTimeout(this.retryPlayTimeoutId);
    }

    this.retryPlayTimeoutId = setTimeout(() => {
      this.retryPlayTimeoutId = null;
      this.ensureHeroVideoPlayback();
    }, 250);
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
