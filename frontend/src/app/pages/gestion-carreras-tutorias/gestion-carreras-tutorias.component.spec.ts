/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GestionCarrerasTutoriasComponent } from './gestion-carreras-tutorias.component';

describe('GestionCarrerasTutoriasComponent', () => {
  let component: GestionCarrerasTutoriasComponent;
  let fixture: ComponentFixture<GestionCarrerasTutoriasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionCarrerasTutoriasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionCarrerasTutoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
