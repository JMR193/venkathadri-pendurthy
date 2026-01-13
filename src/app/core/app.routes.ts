import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home/home.component';
import { DarshanComponent } from '../features/darshan/darshan.component';
import { BookingComponent } from '../features/booking/booking.component';
import { AdminComponent } from '../features/admin/admin.component';
import { HistoryComponent } from '../features/history/history.component';
import { EHundiComponent } from '../features/e-hundi/e-hundi.component';
import { LibraryComponent } from '../features/library/library.component';
import { GalleryComponent } from '../features/gallery/gallery.component';
import { FeedbackComponent } from '../features/feedback/feedback.component';
import { ProfileComponent } from '../features/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'darshan', component: DarshanComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'e-hundi', component: EHundiComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];