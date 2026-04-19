import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SiteShell } from '../../components/site-shell/site-shell';

type HealthOption = 'sim' | 'nao';
type LessonType = 'grupo' | 'particular';
type GroupTeacher = 'Igor' | 'Iago' | 'Igor e Iago' | 'Luis' | 'Thiago';

type GroupSchedule = {
  teacher: GroupTeacher;
  times: string[];
};

@Component({
  selector: 'app-reservar-aula',
  imports: [CommonModule, ReactiveFormsModule, SiteShell],
  templateUrl: './reservar-aula.html',
  styleUrl: './reservar-aula.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservarAula implements OnInit, OnDestroy {
  protected readonly days = ['Segunda', 'Quarta', 'Sexta'];
  protected readonly groupSchedules: GroupSchedule[] = [
    { teacher: 'Igor', times: ['17h', '19h'] },
    { teacher: 'Iago', times: ['18h', '20h'] },
    { teacher: 'Igor e Iago', times: ['21h'] },
    { teacher: 'Luis', times: ['16h'] },
    { teacher: 'Thiago', times: ['6h'] },
  ];
  protected readonly privateTeachers = [
    { name: 'Igor', whatsappUrl: 'https://wa.me/0000000000000' },
    { name: 'Iago', whatsappUrl: 'https://wa.me/0000000000000' },
    { name: 'Luis', whatsappUrl: 'https://wa.me/0000000000000' },
    { name: 'Thiago', whatsappUrl: 'https://wa.me/0000000000000' },
  ];

  protected submitAttempted = false;
  protected successMessage = '';
  protected readonly bookingForm: FormGroup;

  protected showHealthDetails = false;
  protected showGroupBox = true;
  protected showPrivateBox = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.bookingForm = this.formBuilder.group(
      {
        name: new FormControl('', { nonNullable: true, validators: this.nameValidators() }),
        age: new FormControl<number | null>(null, {
          validators: [Validators.required, Validators.min(1), Validators.max(90), Validators.pattern(/^\d+$/)],
        }),
        sex: new FormControl('', { nonNullable: true, validators: [Validators.required] }),

        email: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email, Validators.maxLength(80)],
        }),
        phone: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.pattern(/^[\d\s\(\)\-\+]{8,20}$/)],
        }),

        hasHealthCondition: new FormControl<HealthOption>('nao', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        healthConditionDetails: new FormControl({ value: '', disabled: true }),

        lessonType: new FormControl<LessonType>('grupo', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        groupDay: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        groupTime: new FormControl('', { nonNullable: true }),
        groupTeacher: new FormControl('', { nonNullable: true }),
      },
      {
        validators: [this.groupSchedulingValidator()],
      },
    );
  }

  ngOnInit(): void {
    this.setupConditionalValidation();
    this.setupGroupScheduleSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Computed getters ────────────────────────────────────────────────────────

  protected get availableTeachers(): GroupTeacher[] {
    return this.groupSchedules.map((s) => s.teacher);
  }

  protected get availableTimes(): string[] {
    const teacher = this.bookingForm.get('groupTeacher')?.value as GroupTeacher | '';
    if (!teacher) {
      return this.uniqueTimes(this.groupSchedules.flatMap((s) => s.times));
    }
    const selected = this.groupSchedules.find((s) => s.teacher === teacher);
    return selected ? selected.times : [];
  }

  // ─── Validation helpers ──────────────────────────────────────────────────────

  protected getControl(name: string): AbstractControl | null {
    return this.bookingForm.get(name);
  }

  protected isFieldInvalid(name: string): boolean {
    const control = this.getControl(name);
    return !!control && control.invalid && (control.touched || this.submitAttempted);
  }

  protected isGroupScheduleInvalid(): boolean {
    return this.showGroupBox && this.bookingForm.hasError('groupScheduleRequired') && this.submitAttempted;
  }

  protected getFieldError(name: string): string {
    const control = this.getControl(name);
    if (!control?.errors || !(control.touched || this.submitAttempted)) return '';

    if (control.hasError('required')) {
      const msgs: Record<string, string> = {
        name: 'Informe o nome.',
        age: 'Informe a idade.',
        sex: 'Selecione o sexo.',
        email: 'Informe o e-mail.',
        phone: 'Informe o telefone.',
        healthConditionDetails: 'Descreva a condição de saúde ou a necessidade de adaptação.',
        groupDay: 'Selecione o dia da aula.',
      };
      return msgs[name] ?? 'Preencha este campo.';
    }
    if (control.hasError('minlength')) {
      return name === 'healthConditionDetails'
        ? 'Descreva a condição com mais detalhes.'
        : 'Use pelo menos 3 letras.';
    }
    if (control.hasError('maxlength')) {
      return name === 'healthConditionDetails'
        ? 'Use no máximo 220 caracteres na descrição.'
        : 'Use no máximo 20 letras.';
    }
    if (control.hasError('pattern')) {
      if (name === 'age') return 'Digite apenas números.';
      if (name === 'phone') return 'Informe um telefone válido.';
      return 'Use apenas letras e espaços.';
    }
    if (control.hasError('email')) return 'Informe um e-mail válido.';
    if (control.hasError('min') && name === 'age') return 'Informe uma idade válida.';
    if (control.hasError('max') && name === 'age') return 'Para continuar, informe uma idade válida de até 90 anos.';

    return 'Revise este campo.';
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  protected onSubmit(): void {
    this.submitAttempted = true;
    this.successMessage = '';

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const payload = this.bookingForm.getRawValue();
    console.log('Reserva de aula experimental pronta para integração:', payload);
    this.successMessage = 'Solicitação preenchida com sucesso.';
    this.cdr.markForCheck();
  }

  // ─── Reactive setup ──────────────────────────────────────────────────────────

  private setupConditionalValidation(): void {
    this.bookingForm
      .get('hasHealthCondition')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: HealthOption) => {
        const detailsCtrl = this.bookingForm.get('healthConditionDetails')!;

        if (value === 'sim') {
          detailsCtrl.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(220)]);
          detailsCtrl.enable({ emitEvent: false });
          this.showHealthDetails = true;
        } else {
          detailsCtrl.clearValidators();
          detailsCtrl.setValue('', { emitEvent: false });
          detailsCtrl.disable({ emitEvent: false });
          this.showHealthDetails = false;
        }

        detailsCtrl.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });

    this.bookingForm
      .get('lessonType')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: LessonType) => {
        const dayCtrl = this.bookingForm.get('groupDay')!;
        const timeCtrl = this.bookingForm.get('groupTime')!;
        const teacherCtrl = this.bookingForm.get('groupTeacher')!;

        if (value === 'grupo') {
          dayCtrl.setValidators([Validators.required]);
          dayCtrl.enable({ emitEvent: false });
          timeCtrl.enable({ emitEvent: false });
          teacherCtrl.enable({ emitEvent: false });
          this.showGroupBox = true;
          this.showPrivateBox = false;
        } else {
          dayCtrl.clearValidators();
          dayCtrl.setValue('', { emitEvent: false });
          timeCtrl.setValue('', { emitEvent: false });
          teacherCtrl.setValue('', { emitEvent: false });
          dayCtrl.disable({ emitEvent: false });
          timeCtrl.disable({ emitEvent: false });
          teacherCtrl.disable({ emitEvent: false });
          this.showGroupBox = false;
          this.showPrivateBox = true;
        }

        dayCtrl.updateValueAndValidity({ emitEvent: false });
        this.bookingForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });
  }

  private setupGroupScheduleSync(): void {
    this.bookingForm
      .get('groupTime')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((time: string) => {
        if (!this.showGroupBox || !time) return;
        const match = this.groupSchedules.find((s) => s.times.includes(time));
        if (match) {
          this.bookingForm.get('groupTeacher')!.setValue(match.teacher, { emitEvent: false });
        }
      });

    this.bookingForm
      .get('groupTeacher')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((teacher: string) => {
        if (!this.showGroupBox || !teacher) return;
        const compatible = this.groupSchedules.find((s) => s.teacher === teacher)?.times ?? [];
        const currentTime = this.bookingForm.get('groupTime')!.value;

        if (compatible.length === 1) {
          this.bookingForm.get('groupTime')!.setValue(compatible[0], { emitEvent: false });
          return;
        }
        if (currentTime && !compatible.includes(currentTime)) {
          this.bookingForm.get('groupTime')!.setValue('', { emitEvent: false });
        }
      });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private nameValidators() {
    return [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/),
    ];
  }

  private uniqueTimes(times: string[]): string[] {
    return [...new Set(times)].sort((a, b) => this.parseHour(a) - this.parseHour(b));
  }

  private parseHour(label: string): number {
    return Number.parseInt(label.replace('h', ''), 10);
  }

  private groupSchedulingValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors | null => {
      if (fg.get('lessonType')?.value !== 'grupo') return null;
      const day = fg.get('groupDay')?.value;
      const time = fg.get('groupTime')?.value;
      const teacher = fg.get('groupTeacher')?.value;
      if (!day || (!time && !teacher)) return { groupScheduleRequired: true };
      return null;
    };
  }
}