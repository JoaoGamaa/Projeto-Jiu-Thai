import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-sobre',
  imports: [RouterLink, SiteShell],
  templateUrl: './sobre.html',
  styleUrl: './sobre.css',
})
export class Sobre {}
