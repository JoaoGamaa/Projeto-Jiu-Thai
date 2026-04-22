import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-aulas',
  imports: [RouterLink, SiteShell],
  templateUrl: './aulas.html',
  styleUrl: './aulas.css',
})
export class Aulas {}
