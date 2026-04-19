import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-conhecer',
  imports: [SiteShell],
  templateUrl: './conhecer.html',
  styleUrl: './conhecer.css',
})
export class Conhecer {
  protected readonly academyName = 'Jiu Thai';
  protected readonly academyAddress =
    'R. Janete Achy Silveira, 250 - Alto da Boa Vista, Vitória da Conquista - BA, 45027-510';
  protected readonly mapsDirectionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=R.%20Janete%20Achy%20Silveira%2C%20250%20-%20Alto%20da%20Boa%20Vista%2C%20Vit%C3%B3ria%20da%20Conquista%20-%20BA%2C%2045027-510';
  protected readonly mapsEmbedUrl: SafeResourceUrl;

  constructor(private readonly sanitizer: DomSanitizer) {
    const destinationQuery = encodeURIComponent(this.academyAddress);

    this.mapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${destinationQuery}&t=&z=17&ie=UTF8&iwloc=&output=embed`,
    );
  }
}
