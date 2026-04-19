import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conhecer } from './conhecer';

describe('Conhecer', () => {
  let component: Conhecer;
  let fixture: ComponentFixture<Conhecer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conhecer],
    }).compileComponents();

    fixture = TestBed.createComponent(Conhecer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
