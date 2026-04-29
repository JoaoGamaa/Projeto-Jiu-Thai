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
      name: 'IGOR',
      image: '/assets/ImagensProfessores/PROFESSOR 1 - IGOR.jpg',
      description:
        'Professor com condução firme e leitura técnica precisa. Seu trabalho em aula reforça base sólida, intensidade controlada e evolução contínua para quem quer treinar com seriedade.',
    },
    {
      name: 'IAGO',
      image: '/assets/ImagensProfessores/PROFESSOR 2 - IAGO.jpg',
      description:
        'Professor focado em ritmo de treino, correção de detalhes e construção de confiança. Sua metodologia equilibra disciplina, clareza e exigência dentro de um ambiente forte.',
    },
    {
      name: 'THIAGO',
      image: '/assets/ImagensProfessores/PROFESSOR 3 - THIAGO.jpg',
      description:
        'Professor com perfil técnico e abordagem direta. Em aula, prioriza execução limpa, constância e desenvolvimento progressivo para alunos que buscam crescimento real.',
    },
    // {
    //   name: 'LUIS',
    //   image: '/assets/ImagensProfessores/PROFESSOR 4 - LUIS.jpg',
    //   description:
    //     'Professor com condução firme e leitura técnica precisa. Seu trabalho em aula reforça base sólida, intensidade controlada e evolução contínua para quem quer treinar com seriedade.',
    // },
    {
      name: 'JHON',
      image: '/assets/ImagensProfessores/PROFESSOR 5 - JHON.jpg',
      description:
        'Professor com vasta experiência e liderança natural. Sua abordagem inspira confiança e motivação, promovendo um ambiente de treino positivo e produtivo.',
    },
  ];
}
