import { Component, OnInit } from '@angular/core';
import { SortEvent } from 'primeng/api';

import { AuditsService } from '../../../services/audits-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'audits',
  templateUrl: './audits.component.html',
  providers: [DatePipe],
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./audits.component.scss'],
})

export class AuditsComponent implements OnInit {
  filters: { [key: string]: string } = {
    entityId: '',
    entityName: '',
    createdDate: '',
    createdBy: '',
    operation: ''
  };

  audits: any[];
  selectedAudits: any[];
  submitted: boolean;
  loading: boolean = false;

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  tituloVerMas: string = 'Contenido completo'
  sortField
  sortOrder

  entityAudit: any;
  entityAuditDialog: boolean;
  moreDialogVisible: boolean = false; // Visibilidad del diálogo "Ver más"
  moreDialogContent: string = '';

  constructor(
    private auditsService: AuditsService,
    private datePipe: DatePipe
  ) {}

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'yyyy-MM-dd HH:mm') || '';
  }

  async ngOnInit() {
    this.loading = true
    this.refrescarListado();
    this.loading = false
  }

  // Método para manejar los cambios en los inputs
  filterGlobal(event: Event, field: string) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.filters[field] = inputValue;

    // Verifica si todos los campos cumplen con la condición
    const allFieldsValid = Object.values(this.filters).every(value => value.length === 0 || value.length >= 3);

    // Si todos los campos son válidos, refresca el listado
    if (allFieldsValid) {
      this.refrescarListado();
    }
  }


  onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      this.refrescarListado();
    }
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }

  async refrescarListado(){
    const response = await this.auditsService.obtenerAudits(
        this.filters,
      this.first / this.pageSize,
      this.pageSize,
      this.sortField,
      this.sortOrder
    );
    console.log(response)

    this.audits = response.data;
    this.totalRecords = response.totalRecords;
  }

  viewAuditEntity(entityAudit: any) {
    this.entityAudit = { ...entityAudit };
    this.entityAudit.createdDate = this.formatDate(this.entityAudit.createdDate)
    this.entityAuditDialog = true;
  }

  hideDialog() {
    this.entityAuditDialog = false;
  }

  showMore(content: string, tituloVerMas: string): void {
    this.moreDialogContent = content;
    this.tituloVerMas = tituloVerMas
    this.moreDialogVisible = true;
  }


}
