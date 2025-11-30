import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarTutoriaModalComponent } from './agregar-tutoria-modal.component';

describe('AgregarTutoriaModalComponent', () => {
  let component: AgregarTutoriaModalComponent;
  let fixture: ComponentFixture<AgregarTutoriaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarTutoriaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarTutoriaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
