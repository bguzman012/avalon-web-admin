import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { ButtonModule, CardModule, FormModule, GridModule, TableModule, UtilitiesModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';
import { DocsComponentsModule } from '../../../../components';
import { ClientesMembresiasVencidComponent } from './clientes-membresias-vencid.component';

describe('ClientesPolizasComponent', () => {
  let component: ClientesMembresiasVencidComponent;
  let fixture: ComponentFixture<ClientesMembresiasVencidComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientesMembresiasVencidComponent],
      imports: [CardModule, GridModule, FormsModule, FormModule, ButtonModule, DocsComponentsModule, RouterTestingModule,
        TableModule, UtilitiesModule],
      providers: [IconSetService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    iconSetService = TestBed.inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(ClientesMembresiasVencidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
