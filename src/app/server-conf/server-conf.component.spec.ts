import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerConfComponent } from './server-conf.component';

describe('ServerConfComponent', () => {
  let component: ServerConfComponent;
  let fixture: ComponentFixture<ServerConfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerConfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
