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
        // User is logged in, call the API to check for existing projects
        return this.service.getProjects().pipe(
            map((projects) => {
                if (true) {
                    // if (projects.data.data.length==0) {
                    // No existing projects, redirect to create project route
                    this.router.navigate(['/project']);
                    return false;
                } else {
                    // Existing projects, allow access to layout page
                    return true;
                }
            }),
            // Handle API errors gracefully (optional)
            tap((success) => {
                if (!success) {
                    this.router.navigate(['/error']); // Redirect to error page
                }
            })
        );
    }
}
