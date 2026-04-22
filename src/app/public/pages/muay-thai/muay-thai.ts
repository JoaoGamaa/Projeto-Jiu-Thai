import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-muay-thai',
  imports: [RouterLink, SiteShell],
  templateUrl: './muay-thai.html',
  styleUrl: './muay-thai.css',
})
export class MuayThai {}
