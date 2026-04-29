import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteShell } from '../../components/site-shell/site-shell';

@Component({
  selector: 'app-contato',
  imports: [CommonModule, ReactiveFormsModule, SiteShell],
  templateUrl: './contato.html',
  styleUrl: './contato.css',
})
export class Contato {
  protected readonly whatsappLabel = '(77) 99124-8244';
  protected readonly whatsappUrl = 'https://wa.me/5577991248244';
  protected readonly emailAddress = 'contato@jiuthai.com';
  protected readonly contactForm: FormGroup;
  protected submitAttempted = false;

  constructor(private readonly formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      name: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(600)]],
    });
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.submitAttempted);
  }

  protected getFieldError(fieldName: string): string {
    const control = this.contactForm.get(fieldName);

    if (!control?.errors || !(control.touched || this.submitAttempted)) {
      return '';
    }

    if (control.hasError('required')) {
      const messages: Record<string, string> = {
        name: 'Informe seu nome.',
        email: 'Informe seu e-mail.',
        message: 'Escreva sua mensagem.',
      };

      return messages[fieldName] ?? 'Preencha este campo.';
    }

    if (control.hasError('minlength')) {
      if (fieldName === 'message') {
        return 'A mensagem precisa ter pelo menos 10 caracteres.';
      }

      return 'Use pelo menos 3 letras.';
    }

    if (control.hasError('maxlength')) {
      if (fieldName === 'message') {
        return 'A mensagem pode ter no máximo 600 caracteres.';
      }

      return 'Use no máximo 40 caracteres.';
    }

    if (control.hasError('pattern')) {
      return 'Use apenas letras e espaços no nome.';
    }

    if (control.hasError('email')) {
      return 'Informe um e-mail válido.';
    }

    return 'Revise este campo.';
  }

  protected onSubmit(): void {
    this.submitAttempted = true;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { name, email, message } = this.contactForm.getRawValue();
    const subject = encodeURIComponent(`Contato pelo site - ${name}`);
    const body = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`);
    const mailtoUrl = `mailto:${this.emailAddress}?subject=${subject}&body=${body}`;

    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }
  }
}
