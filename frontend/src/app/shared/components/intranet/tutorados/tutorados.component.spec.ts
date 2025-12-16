/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TutoradosComponent } from './tutorados.component';

describe('TutoradosComponent', () => {
  let component: TutoradosComponent;
  let fixture: ComponentFixture<TutoradosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutoradosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutoradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
