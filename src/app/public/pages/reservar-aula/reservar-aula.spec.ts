import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarAula } from './reservar-aula';

describe('ReservarAula', () => {
  let component: ReservarAula;
  let fixture: ComponentFixture<ReservarAula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarAula],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarAula);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});