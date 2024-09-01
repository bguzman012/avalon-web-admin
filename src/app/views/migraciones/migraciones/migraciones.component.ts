import {Component, OnInit} from '@angular/core';
import * as XLSX from 'xlsx';
import {MessageService} from "primeng/api";
import {ClientePolizaService} from "../../../services/polizas-cliente-service";  // Importar XLSX para manejar archivos Excel
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-migraciones',
  templateUrl: './migraciones.component.html',
  styles: [`
    :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
    }
  `],
  styleUrls: ['./migraciones.component.scss'],
})

export class MigracionesComponent implements OnInit {

  selectedFile: File | null = null;
  excelData: any[] = [];  // Array para almacenar datos del Excel
  loading = false
  dateColumns = [10, 23, 24, 29, 30];
  enviado = false
  downloadUrl = 'assets/CLIENTES_POLIZAS_FORMAT.xlsx';

  constructor(private messageService: MessageService,
              private clientesPolizasService: ClientePolizaService) {
  }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    // Verifica que el archivo sea seleccionado correctamente
    const file: File = event.files[0];  // PrimeNG usa event.files en lugar de event.target.files

    if (file) {
      this.selectedFile = file;
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

        // Asumiendo que solo hay un sheet
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        this.excelData = XLSX.utils.sheet_to_json(ws, {header: 1});  // Convierte a JSON

        let cont = 0
        this.excelData = this.excelData.map(row => {
          if (row.length > 0 && cont == 0) { // Verifica que no sea una fila vacía
            row.unshift("ESTADO_MIGRACIÓN"); // Agrega el nuevo valor al inicio del array
          }

          if (row.length > 0 && cont != 0) { // Verifica que no sea una fila vacía
            row.unshift("PENDIENTE"); // Agrega el nuevo valor al inicio del array
          }

          // Convierte las fechas en formato numérico de Excel a formato 'YYYY-MM-DD'
          row = row.map((cell, index) => this.convertExcelDate(cell, index));

          cont++;
          return row;
        });
        this.enviado = false
        console.log(this.excelData)

      };
      reader.readAsBinaryString(file);
    }
  }

  convertExcelDate(cell: any, columnIndex: number): any {
    if (typeof cell === 'number' && this.dateColumns.includes(columnIndex)) {
      // Convertir número de serie de Excel a fecha
      const date = new Date((cell - (25567 + 2)) * 86400 * 1000);
      const formattedDate = date.toISOString().split('T')[0];
      return formattedDate;
    }
    return cell;
  }

  async sendDataToService(fileUploadRef) {
    if (!this.excelData.length || this.enviado) return;

    this.loading = true
    try {
      let cabecera = this.excelData[0]
      cabecera.push("OBSERVACION")

      for (let i = 1; i < this.excelData.length; i++) {
        let valoresMigracion = this.excelData[i]

        if (valoresMigracion.length == 0) continue

        await this.saveClientePoliza(valoresMigracion)
      }

      this.exportarErroresAExcel();

      this.enviado = true
      fileUploadRef.clear()
    } finally {
      this.loading = false;
    }


  }

  async saveClientePoliza(valoresMigracion) {
    console.log(valoresMigracion)
    // this.submitted = true;
    // this.loading = true;


    let migracionRequest = {
      seguro: valoresMigracion[1],
      empresa: valoresMigracion[2],
      correoAsesor: valoresMigracion[3],
      correoAgente: valoresMigracion[4],

      nombres: valoresMigracion[5],
      nombresDos: valoresMigracion[6],
      apellidos: valoresMigracion[7],
      apellidosDos: valoresMigracion[8],
      sexo: valoresMigracion[9],
      fechaNacimiento: valoresMigracion[10],
      tipoPoliza: valoresMigracion[11],
      parentesco: valoresMigracion[12],

      direccionUno: valoresMigracion[13],
      direccionDos: valoresMigracion[14],
      ciudad: valoresMigracion[15],
      estado: valoresMigracion[16],
      pais: valoresMigracion[17],
      codigoPostal: valoresMigracion[18],

      correoElectronico: valoresMigracion[19],
      telefono: valoresMigracion[20],

      poliza: valoresMigracion[21],
      numeroCertificado: valoresMigracion[22],
      fechaInicioPoliza: valoresMigracion[23],
      fechaExpiracionPoliza: valoresMigracion[24],

      numeroIdentificacion: valoresMigracion[25],
      tipoIdentificacion: valoresMigracion[26],

      membresia: valoresMigracion[27],
      membresiaCodigo: valoresMigracion[28],
      fechaInicioMembresia: valoresMigracion[29],
      fechaExpiracionMembresia: valoresMigracion[30],
    }

    let response = await this.clientesPolizasService.crearClientePolizaMigracion(
      migracionRequest
    );

    valoresMigracion[0] = response.estado
    valoresMigracion.push(response.observacion)

  }

  clearImageSelection(fileUploadRef) {
    this.excelData = []
    fileUploadRef.clear(); // Limpiar la selección de archivo en el componente de carga
  }

  exportarErroresAExcel() {
    const datosConErrores = this.excelData.filter(row => row[0] === 'ERROR');

    if (datosConErrores.length > 0) {
      // Agregar la cabecera al inicio de los datos filtrados
      const datosParaExportar = [this.excelData[0], ...datosConErrores];

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datosParaExportar);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Errores');

      const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Reporte_Errores.xlsx');
    } else {
      this.messageService.add({severity: 'info', summary: 'Info', detail: 'No hay registros con estado ERROR para exportar.'});
    }
  }


  //
  //   this.first = 0
  //   await this.refrescarListado();
  //   this.polizaDialog = false;
  //   this.polizaCliente = {};
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: 'Enhorabuena!',
  //     detail: 'Operación ejecutada con éxito',
  //   });
  // } finally {
  //   this.loading = false;
  // }

}
