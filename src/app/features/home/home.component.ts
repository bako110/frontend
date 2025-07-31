import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('carouselContainer', { static: false })
  carouselContainer!: ElementRef;

  query = '';
  medecins: any[] = [];
  suggestions: any[] = [];
  isLoading = false;
  errorMessage = '';
  hover = false;

  featuredMedecins: any[] = [];
  loadingMedecins: boolean = false;
  visibleResultsCount = 2; // 👈 Affiche 2 résultats visibles

  private API_BASE_URL = 'https://sanordv.onrender.com';
  private searchTerms = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFeaturedMedecins();

    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.autocomplete(term))
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.suggestions) {
            this.medecins = response.suggestions.map((s: any) => s.data);
            this.suggestions = [];
          } else {
            this.medecins = [];
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.medecins = [];
          console.error('Erreur autocomplétion', err);
        },
      });
  }

  loadFeaturedMedecins(): void {
    this.loadingMedecins = true;

    this.http.get<any>(`${this.API_BASE_URL}/api/admins/medecins`).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.medecins)) {
          this.featuredMedecins = response.medecins.map((medecin: any) => ({
            id: medecin._id,
            nom: medecin.nom,
            prenom: medecin.prenom,
            specialite: medecin.specialite || 'Spécialité inconnue',
            photo: medecin.photo || 'assets/images/default-doctor.jpg',
            localite: medecin.localite || 'Non précisée',
          })).slice(0, 9);
        } else {
          this.featuredMedecins = [];
        }
        this.loadingMedecins = false;
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.loadingMedecins = false;
        this.errorMessage = 'Erreur lors du chargement des médecins';
      },
    });
  }

  ngAfterViewInit(): void {
    const container = this.carouselContainer.nativeElement as HTMLElement;
    const scrollAmount = 300;
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
  }

  onSearch(): void {
    if (!this.query.trim()) {
      this.medecins = [];
      this.suggestions = [];
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const params = new HttpParams()
      .set('q', this.query)
      .set('type', 'all')
      .set('limit', '10');

    this.http
      .get<any>(`${this.API_BASE_URL}/api/recherche/recherche-avancee`, { params })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.medecins = response.data || [];
            this.suggestions = [];
          } else {
            this.errorMessage =
              response.message || 'Erreur inconnue lors de la recherche';
            this.medecins = [];
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la recherche';
          this.medecins = [];
          console.error('Erreur lors de la recherche:', err);
        },
      });
  }

  onSearchByLetter(letter: string): void {
    this.query = letter;
    this.isLoading = true;
    this.errorMessage = '';

    const params = new HttpParams()
      .set('q', letter)
      .set('type', 'letter')
      .set('limit', '10');

    this.http
      .get<any>(`${this.API_BASE_URL}/api/recherche/recherche-avancee`, { params })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.medecins = response.data || [];
          } else {
            this.errorMessage =
              response.message || 'Erreur inconnue lors de la recherche';
            this.medecins = [];
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la recherche';
          this.medecins = [];
          console.error('Erreur lors de la recherche:', err);
        },
      });
  }

  onAutocompleteInput(value: string): void {
    this.query = value;
    if (value.trim().length >= 1) {
      this.isLoading = true;
      this.searchTerms.next(value);
    } else {
      this.suggestions = [];
      this.medecins = [];
    }
  }

  redirectToDetail(medecinId: string): void {
    if (medecinId) {
      this.router.navigate(['/medecinDetail', medecinId]);
    }
  }

  private autocomplete(query: string) {
    const params = new HttpParams()
      .set('q', query)
      .set('type', 'all')
      .set('limit', '10');

    return this.http.get<any>(
      `${this.API_BASE_URL}/api/recherche/recherche-avancee`,
      { params }
    );
  }

  get visibleMedecins() {
    return this.medecins.slice(0, this.visibleResultsCount);
  }

  get scrollableMedecins() {
    return this.medecins.slice(this.visibleResultsCount);
  }
}
