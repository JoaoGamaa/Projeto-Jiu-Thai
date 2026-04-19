import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-professores',
  imports: [CommonModule, SiteShell],
  templateUrl: './professores.html',
  styleUrl: './professores.css',
})
export class Professores {
  protected readonly professors = [
    {
      name: 'Igor',
      image: '/assets/ImagensProfessores/PROFESSOR 1 - IGOR.jpg',
      description:
        'Professor com condução firme e leitura técnica precisa. Seu trabalho em aula reforça base sólida, intensidade controlada e evolução contínua para quem quer treinar com seriedade.',
    },
    {
      name: 'Iago',
      image: '/assets/ImagensProfessores/PROFESSOR 2 - IAGO.jpg',
      description:
        'Professor focado em ritmo de treino, correção de detalhes e construção de confiança. Sua metodologia equilibra disciplina, clareza e exigência dentro de um ambiente forte.',
    },
    {
      name: 'Luis',
      image: '/assets/placeholder.svg',
      description:
        'Professor com perfil técnico e abordagem direta. Em aula, prioriza execução limpa, constância e desenvolvimento progressivo para alunos que buscam crescimento real.',
    },
    {
      name: 'Thiago',
      image: '/assets/placeholder.svg',
      description:
        'Professor que imprime identidade, presença e alto padrão no treino. Sua condução valoriza cultura de equipe, respeito à arte e desempenho consistente em cada sessão.',
    },
    {
      name: 'Professor 05',
      image: '/assets/placeholder.svg',
      description:
        'Espaço reservado para apresentar mais um nome da equipe. O bloco já está pronto para receber o perfil, a imagem e a proposta técnica do professor depois.',
    },
  ];
}
