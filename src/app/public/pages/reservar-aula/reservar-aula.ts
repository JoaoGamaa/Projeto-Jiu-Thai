import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SiteShell } from '../../components/site-shell/site-shell';

type HealthOption = 'sim' | 'nao';
type LessonType = 'grupo' | 'particular';
type Modality = 'muay-thai' | 'jiu-jitsu' | 'mma';

export type ClassSlot = {
  day: string;
  time: string;   // exibição ex: "06h – 07h"
  teacher: string;
};

/** Tabela completa de horários por modalidade */
const CLASS_SCHEDULE: Record<Modality, ClassSlot[]> = {
  'muay-thai': [
    { day: 'Segunda', time: '06h – 07h', teacher: 'Thiago' },
    { day: 'Quarta', time: '06h – 07h', teacher: 'Thiago' },
    { day: 'Sexta', time: '06h – 07h', teacher: 'Thiago' },
    { day: 'Segunda', time: '16h – 17h', teacher: 'Luis' },
    { day: 'Quarta', time: '16h – 17h', teacher: 'Luis' },
    { day: 'Sexta', time: '16h – 17h', teacher: 'Luis' },
    { day: 'Segunda', time: '17h – 18h', teacher: 'Igor' },
    { day: 'Quarta', time: '17h – 18h', teacher: 'Igor' },
    { day: 'Sexta', time: '17h – 18h', teacher: 'Igor' },
    { day: 'Segunda', time: '18h – 19h', teacher: 'Iago' },
    { day: 'Quarta', time: '18h – 19h', teacher: 'Iago' },
    { day: 'Sexta', time: '18h – 19h', teacher: 'Iago' },
    { day: 'Segunda', time: '19h – 20h', teacher: 'Igor e Iago' },
    { day: 'Quarta', time: '19h – 20h', teacher: 'Igor e Iago' },
    { day: 'Sexta', time: '19h – 20h', teacher: 'Igor e Iago' },
  ],
  'jiu-jitsu': [
    { day: 'Terça', time: '19h – 20h', teacher: 'John Veiga' },
    { day: 'Quinta', time: '19h – 20h', teacher: 'John Veiga' },
  ],
  'mma': [
    { day: 'Terça', time: '18h – 19h', teacher: 'Igor' },
    { day: 'Quinta', time: '18h – 19h', teacher: 'Igor' },
  ],
};

@Component({
  selector: 'app-reservar-aula',
  imports: [CommonModule, ReactiveFormsModule, SiteShell],
  templateUrl: './reservar-aula.html',
  styleUrl: './reservar-aula.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservarAula implements OnInit, OnDestroy {
  protected readonly modalities: { value: Modality; label: string }[] = [
    { value: 'muay-thai',  label: 'Muay Thai'  },
    { value: 'jiu-jitsu', label: 'Jiu-Jitsu'  },
    { value: 'mma',        label: 'MMA'         },
  ];

  protected readonly privateTeachers = [
    { name: 'Igor',       whatsappUrl: 'https://wa.me/5577991248244' },
    { name: 'Iago',       whatsappUrl: 'https://wa.me/5577991248244' },
    { name: 'Luis',       whatsappUrl: 'https://wa.me/5577991248244' },
    { name: 'Thiago',     whatsappUrl: 'https://wa.me/5577991248244' },
    { name: 'John Veiga', whatsappUrl: 'https://wa.me/5577991248244' },
  ];

  protected submitAttempted = false;
  protected successMessage = '';
  protected readonly bookingForm: FormGroup;

  // ── visual state ──────────────────────────────────────────────────────────
  protected showHealthDetails = false;
  protected showGroupBox      = true;
  protected showPrivateBox    = false;

  /** Opções disponíveis para a modalidade selecionada */
  protected availableDays: string[] = [];
  protected availableTimes: string[] = [];
  protected availableTeachers: string[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.bookingForm = this.fb.group(
      {
        // ── Dados pessoais ───────────────────────────────────────────────
        name: new FormControl('', { nonNullable: true, validators: this.nameValidators() }),
        age:  new FormControl<number | null>(null, {
          validators: [Validators.required, Validators.min(1), Validators.max(90), Validators.pattern(/^\d+$/)],
        }),
        sex: new FormControl('', { nonNullable: true, validators: [Validators.required] }),

        // ── Contato ──────────────────────────────────────────────────────
        email: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email, Validators.maxLength(80)],
        }),
        phone: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.pattern(/^[\d\s()\-+]{8,20}$/)],
        }),

        // ── Saúde ─────────────────────────────────────────────────────────
        hasHealthCondition:    new FormControl<HealthOption>('nao', { nonNullable: true, validators: [Validators.required] }),
        healthConditionDetails: new FormControl({ value: '', disabled: true }),

        // ── Tipo de aula ──────────────────────────────────────────────────
        lessonType: new FormControl<LessonType>('grupo', { nonNullable: true, validators: [Validators.required] }),

        // ── Aula em grupo ─────────────────────────────────────────────────
        groupModality: new FormControl<Modality | ''>('', { nonNullable: true, validators: [Validators.required] }),
        groupDay: new FormControl({ value: '', disabled: true }, { validators: [Validators.required] }),
        groupTime: new FormControl({ value: '', disabled: true }),
        groupTeacher: new FormControl({ value: '', disabled: true }),
      },
      {
        validators: [this.groupSchedulingValidator()],
      },
    );
  }

  ngOnInit(): void {
    this.setupConditionalValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  protected get selectedSchedule(): ClassSlot | null {
    const modality = this.bookingForm.get('groupModality')?.value as Modality | '';
    const day = this.bookingForm.get('groupDay')?.value as string;
    const time = this.bookingForm.get('groupTime')?.value as string;
    const teacher = this.bookingForm.get('groupTeacher')?.value as string;

    if (!modality || !day || (!time && !teacher)) return null;

    return (
      CLASS_SCHEDULE[modality].find(
        (slot) => slot.day === day && (!time || slot.time === time) && (!teacher || slot.teacher === teacher),
      ) ?? null
    );
  }

  // ─── Validation helpers ───────────────────────────────────────────────────

  protected getControl(name: string): AbstractControl | null {
    return this.bookingForm.get(name);
  }

  protected isFieldInvalid(name: string): boolean {
    const ctrl = this.getControl(name);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitAttempted);
  }

  protected isGroupScheduleInvalid(): boolean {
    return (
      this.showGroupBox &&
      this.bookingForm.hasError('groupScheduleRequired') &&
      this.submitAttempted
    );
  }

  protected getFieldError(name: string): string {
    const ctrl = this.getControl(name);
    if (!ctrl?.errors || !(ctrl.touched || this.submitAttempted)) return '';

    if (ctrl.hasError('required')) {
      const msgs: Record<string, string> = {
        name:                   'Informe o nome.',
        age:                    'Informe a idade.',
        sex:                    'Selecione o sexo.',
        email:                  'Informe o e-mail.',
        phone:                  'Informe o telefone.',
        healthConditionDetails: 'Descreva a condição de saúde ou a necessidade de adaptação.',
        groupModality:          'Selecione a modalidade.',
        groupDay:               'Selecione o dia.',
      };
      return msgs[name] ?? 'Preencha este campo.';
    }
    if (ctrl.hasError('minlength')) {
      return name === 'healthConditionDetails' ? 'Descreva a condição com mais detalhes.' : 'Use pelo menos 3 letras.';
    }
    if (ctrl.hasError('maxlength')) {
      return name === 'healthConditionDetails' ? 'Use no máximo 220 caracteres.' : 'Use no máximo 20 letras.';
    }
    if (ctrl.hasError('pattern')) {
      if (name === 'age')   return 'Digite apenas números.';
      if (name === 'phone') return 'Informe um telefone válido.';
      return 'Use apenas letras e espaços.';
    }
    if (ctrl.hasError('email')) return 'Informe um e-mail válido.';
    if (ctrl.hasError('min') && name === 'age') return 'Informe uma idade válida.';
    if (ctrl.hasError('max') && name === 'age') return 'Para continuar, informe uma idade válida de até 90 anos.';

    return 'Revise este campo.';
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  protected onSubmit(): void {
    this.submitAttempted = true;
    this.successMessage  = '';

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const raw  = this.bookingForm.getRawValue();
    const schedule = this.selectedSchedule;
    const payload = { ...raw, resolvedSchedule: schedule };
    console.log('Reserva de aula experimental pronta para integração:', payload);
    this.resetForm();
    this.successMessage = 'Solicitação preenchida com sucesso.';
    this.cdr.markForCheck();
  }

  // ─── Reactive setup ───────────────────────────────────────────────────────

  private setupConditionalValidation(): void {
    // hasHealthCondition → textarea de detalhes
    this.bookingForm.get('hasHealthCondition')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: HealthOption) => {
        const ctrl = this.bookingForm.get('healthConditionDetails')!;
        if (value === 'sim') {
          ctrl.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(220)]);
          ctrl.enable({ emitEvent: false });
          this.showHealthDetails = true;
        } else {
          ctrl.clearValidators();
          ctrl.setValue('', { emitEvent: false });
          ctrl.disable({ emitEvent: false });
          this.showHealthDetails = false;
        }
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });

    // lessonType → alterna boxes grupo / particular
    this.bookingForm.get('lessonType')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: LessonType) => {
        const modalityCtrl = this.bookingForm.get('groupModality')!;
        const dayCtrl = this.bookingForm.get('groupDay')!;
        const timeCtrl = this.bookingForm.get('groupTime')!;
        const teacherCtrl = this.bookingForm.get('groupTeacher')!;

        if (value === 'grupo') {
          modalityCtrl.setValidators([Validators.required]);
          modalityCtrl.enable({ emitEvent: false });
          this.showGroupBox   = true;
          this.showPrivateBox = false;
        } else {
          modalityCtrl.clearValidators();
          modalityCtrl.setValue('', { emitEvent: false });
          dayCtrl.clearValidators();
          dayCtrl.setValue('', { emitEvent: false });
          timeCtrl.setValue('', { emitEvent: false });
          teacherCtrl.setValue('', { emitEvent: false });
          modalityCtrl.disable({ emitEvent: false });
          dayCtrl.disable({ emitEvent: false });
          timeCtrl.disable({ emitEvent: false });
          teacherCtrl.disable({ emitEvent: false });
          this.availableDays = [];
          this.availableTimes = [];
          this.availableTeachers = [];
          this.showGroupBox   = false;
          this.showPrivateBox = true;
        }

        modalityCtrl.updateValueAndValidity({ emitEvent: false });
        dayCtrl.updateValueAndValidity({ emitEvent: false });
        timeCtrl.updateValueAndValidity({ emitEvent: false });
        teacherCtrl.updateValueAndValidity({ emitEvent: false });
        this.bookingForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });

    // groupModality → carrega dias e habilita a primeira etapa do agendamento
    this.bookingForm.get('groupModality')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((modality: Modality | '') => {
        const dayCtrl = this.bookingForm.get('groupDay')!;
        const timeCtrl = this.bookingForm.get('groupTime')!;
        const teacherCtrl = this.bookingForm.get('groupTeacher')!;

        dayCtrl.setValue('', { emitEvent: false });
        timeCtrl.setValue('', { emitEvent: false });
        teacherCtrl.setValue('', { emitEvent: false });

        this.availableTimes = [];
        this.availableTeachers = [];

        if (modality && modality in CLASS_SCHEDULE) {
          this.availableDays = [...new Set(CLASS_SCHEDULE[modality].map((slot) => slot.day))];
          dayCtrl.setValidators([Validators.required]);
          dayCtrl.enable({ emitEvent: false });
        } else {
          this.availableDays = [];
          dayCtrl.clearValidators();
          dayCtrl.disable({ emitEvent: false });
        }

        timeCtrl.disable({ emitEvent: false });
        teacherCtrl.disable({ emitEvent: false });

        dayCtrl.updateValueAndValidity({ emitEvent: false });
        timeCtrl.updateValueAndValidity({ emitEvent: false });
        teacherCtrl.updateValueAndValidity({ emitEvent: false });
        this.bookingForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });

    // groupDay → filtra horário e professor para o dia escolhido
    this.bookingForm.get('groupDay')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((day: string) => {
        const modality = this.bookingForm.get('groupModality')?.value as Modality | '';
        const timeCtrl = this.bookingForm.get('groupTime')!;
        const teacherCtrl = this.bookingForm.get('groupTeacher')!;

        timeCtrl.setValue('', { emitEvent: false });
        teacherCtrl.setValue('', { emitEvent: false });

        if (modality && day) {
          const schedules = CLASS_SCHEDULE[modality].filter((slot) => slot.day === day);
          this.availableTimes = [...new Set(schedules.map((slot) => slot.time))];
          this.availableTeachers = [...new Set(schedules.map((slot) => slot.teacher))];
          timeCtrl.enable({ emitEvent: false });
          teacherCtrl.enable({ emitEvent: false });
        } else {
          this.availableTimes = [];
          this.availableTeachers = [];
          timeCtrl.disable({ emitEvent: false });
          teacherCtrl.disable({ emitEvent: false });
        }

        timeCtrl.updateValueAndValidity({ emitEvent: false });
        teacherCtrl.updateValueAndValidity({ emitEvent: false });
        this.bookingForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });

    // groupTime → ajusta professor automaticamente quando houver correspondência exata
    this.bookingForm.get('groupTime')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((time: string) => {
        const modality = this.bookingForm.get('groupModality')?.value as Modality | '';
        const day = this.bookingForm.get('groupDay')?.value as string;
        const teacherCtrl = this.bookingForm.get('groupTeacher')!;

        if (!modality || !day) return;

        if (!time) {
          teacherCtrl.setValue('', { emitEvent: false });
        } else {
          const match = CLASS_SCHEDULE[modality].find((slot) => slot.day === day && slot.time === time);
          if (match) {
            teacherCtrl.setValue(match.teacher, { emitEvent: false });
          }
        }

        this.bookingForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });

    // groupTeacher → ajusta horário automaticamente quando houver correspondência exata
    this.bookingForm.get('groupTeacher')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((teacher: string) => {
        const modality = this.bookingForm.get('groupModality')?.value as Modality | '';
        const day = this.bookingForm.get('groupDay')?.value as string;
        const timeCtrl = this.bookingForm.get('groupTime')!;

        if (!modality || !day) return;

        if (!teacher) {
          timeCtrl.setValue('', { emitEvent: false });
        } else {
          const match = CLASS_SCHEDULE[modality].find((slot) => slot.day === day && slot.teacher === teacher);
          if (match) {
            timeCtrl.setValue(match.time, { emitEvent: false });
          }
        }

        this.bookingForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });
  }

  // ─── Validators ───────────────────────────────────────────────────────────

  private groupSchedulingValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors | null => {
      if (fg.get('lessonType')?.value !== 'grupo') return null;
      const modality = fg.get('groupModality')?.value;
      const day = fg.get('groupDay')?.value;
      const time = fg.get('groupTime')?.value;
      const teacher = fg.get('groupTeacher')?.value;
      if (!modality || !day || (!time && !teacher)) {
        return { groupScheduleRequired: true };
      }
      return null;
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private nameValidators() {
    return [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/),
    ];
  }

  private resetForm(): void {
    this.bookingForm.reset(
      {
        name: '',
        age: null,
        sex: '',
        email: '',
        phone: '',
        hasHealthCondition: 'nao',
        healthConditionDetails: '',
        lessonType: 'grupo',
        groupModality: '',
        groupDay: '',
        groupTime: '',
        groupTeacher: '',
      },
      { emitEvent: true },
    );

    this.submitAttempted = false;
    this.showHealthDetails = false;
    this.showGroupBox = true;
    this.showPrivateBox = false;
    this.availableDays = [];
    this.availableTimes = [];
    this.availableTeachers = [];
  }
}
