import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiuJitsu } from './jiu-jitsu';

describe('JiuJitsu', () => {
  let component: JiuJitsu;
  let fixture: ComponentFixture<JiuJitsu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JiuJitsu],
    }).compileComponents();

    fixture = TestBed.createComponent(JiuJitsu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
