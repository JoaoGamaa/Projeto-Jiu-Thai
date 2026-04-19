import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorqueJiuThai } from './porque-jiu-thai';

describe('PorqueJiuThai', () => {
  let component: PorqueJiuThai;
  let fixture: ComponentFixture<PorqueJiuThai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PorqueJiuThai],
    }).compileComponents();

    fixture = TestBed.createComponent(PorqueJiuThai);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
