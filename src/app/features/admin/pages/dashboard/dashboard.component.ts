import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalPatients: number = 0;
  medecinsActifs: number = 0;
  totalRendezVous: number = 0;
  isLoading: boolean = true; // Ajout du flag de chargement

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef  // Injection de ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerStats();
  }

  chargerStats(): void {
    this.isLoading = true; // Début du chargement
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Statistiques du tableau de bord:', data);
        this.totalPatients = data.totalPatients;
        this.medecinsActifs = data.medecinsActifs;
        this.totalRendezVous = data.totalRendezVous;

        this.isLoading = false; // Fin du chargement
        this.cd.detectChanges(); // Mise à jour du template
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
        this.isLoading = false; // Fin du chargement même en cas d’erreur
        this.cd.detectChanges();
      }
    });
  }
}
