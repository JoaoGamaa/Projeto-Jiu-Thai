import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuayThai } from './muay-thai';

describe('MuayThai', () => {
  let component: MuayThai;
  let fixture: ComponentFixture<MuayThai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuayThai],
    }).compileComponents();

    fixture = TestBed.createComponent(MuayThai);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
