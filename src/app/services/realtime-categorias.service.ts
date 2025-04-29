import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RealtimeCategoriasService implements OnDestroy {
  private pb: PocketBase;
  private categoriasSubject = new BehaviorSubject<any[]>([]);
  public categorias: any[] = [];
  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public categorias$: Observable<any[]> =
    this.categoriasSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8050');
    this.subscribeToCategorias();
  }

  private async subscribeToCategorias() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('admin@admin.com', 'admin1234');

    // Suscribirse a cambios en cualquier registro de la colección 'supervisors'
    this.pb.collection('categories').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de esupervisoras
    this.updateCategoriasList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de esupervisoras
    this.updateCategoriasList();
  }

  private async updateCategoriasList() {
    // Obtener la lista actualizada de esupervisoras
    const records = await this.pb
      .collection('categories')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: '-created', // Ordenar por fecha de creación
      });
    this.categoriasSubject.next(records);
  }

  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('categories').unsubscribe('*');
  }

  getCategoriasCount(): number {
    return this.categoriasSubject.value.length;
  } 
}
