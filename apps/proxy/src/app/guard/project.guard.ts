import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { CreateProjectService } from '@proxy/services/proxy/create-project';

@Injectable({
    providedIn: 'root',
})
export class ProjectGuard implements CanActivate {
    constructor(private service: CreateProjectService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.service.getProjects().pipe(
            map((projects) => {
                if (projects.data.data.length == 0) {
                    this.router.navigate(['/project']);
                    return false;
                } else {
                    return true;
                }
            }),

            tap((success) => {
                if (!success) {
                    this.router.navigate(['/error']);
                }
            })
        );
    }
}
