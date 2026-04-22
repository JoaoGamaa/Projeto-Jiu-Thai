import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemosECondicoes } from './temos-e-condicoes';

describe('TemosECondicoes', () => {
  let component: TemosECondicoes;
  let fixture: ComponentFixture<TemosECondicoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemosECondicoes],
    }).compileComponents();

    fixture = TestBed.createComponent(TemosECondicoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
