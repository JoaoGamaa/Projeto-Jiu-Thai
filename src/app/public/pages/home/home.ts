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
    video.volume = 0;
    video.playsInline = true;
    video.preload = 'auto';
    this.ensureHeroVideoPlayback();

    video.addEventListener('loadedmetadata', this.ensureHeroVideoPlayback);
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
