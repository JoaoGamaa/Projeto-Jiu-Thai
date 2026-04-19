import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-jiu-jitsu',
  imports: [RouterLink, SiteShell],
  templateUrl: './jiu-jitsu.html',
  styleUrl: './jiu-jitsu.css',
})
export class JiuJitsu {}
