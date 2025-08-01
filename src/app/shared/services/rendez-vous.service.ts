import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RendezVous } from '../../shared/models/rdv-model';
import { environment } from '../../../environment/environments';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private nouveauxRdvSubject = new BehaviorSubject<number>(0);
  nouveauxRdv$ = this.nouveauxRdvSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
    };
  }

  increment(): void {
    this.nouveauxRdvSubject.next(this.nouveauxRdvSubject.value + 1);
  }

  decrement(): void {
    const current = this.nouveauxRdvSubject.value;
    if (current > 0) {
      this.nouveauxRdvSubject.next(current - 1);
    }
  }

  reset(): void {
    this.nouveauxRdvSubject.next(0);
  }

  getAllRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.apiUrl, this.getHeaders());
  }

  getRendezVousByPatient(patientId: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(
      `${this.apiUrl}/patient/${patientId}`,
      this.getHeaders()
    );
  }

  annulerRendezVous(params: {
    creneauId: string;
    timeSlotId: string;
    userId: string;
    userType: string;
    motifAnnulation: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/annuler`,
      params,
      this.getHeaders()
    );
  }

  modifierRendezVous(id: string, data: Partial<RendezVous>): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/modifier`,
      data,
      this.getHeaders()
    );
  }

  creerRendezVous(rdv: Partial<RendezVous>): Observable<RendezVous> {
    return this.http.post<RendezVous>(
      this.apiUrl,
      rdv,
      this.getHeaders()
    );
  }

  prendreRendezVous(data: {
    creneauId: string;
    timeSlotId: string;
    patientId: string;
    motifRendezVous: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data, this.getHeaders());
  }
}
