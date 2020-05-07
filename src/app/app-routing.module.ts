import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SendMailsComponent } from './send-mails/send-mails.component';
import { EditComponent } from './edit/edit.component';
import { ServerConfComponent } from './server-conf/server-conf.component';

const routes: Routes = [
  {path: '', redirectTo: '/send', pathMatch: 'full'},
  {path: 'send', component: SendMailsComponent},
  {path: 'edit', component: EditComponent},
  {path: 'conf', component: ServerConfComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
