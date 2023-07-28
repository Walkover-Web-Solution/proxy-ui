import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';

@NgModule({
    imports: [CommonModule],
})
export class ServicesPermissionModule {}

@Injectable({
    providedIn: ServicesPermissionModule,
})
export class MSG91PermissionService {
    private allowedPermissions: string[] = [];

    constructor() {}

    public addPermissions(permissions: string[]): void {
        this.allowedPermissions = [...this.allowedPermissions, ...permissions];
    }

    public hasPermission(permission: string): Promise<boolean> {
        return Promise.resolve(this.allowedPermissions.find((e) => e === permission) ? true : false);
    }

    public flushPermissions(): void {
        this.allowedPermissions = [];
    }
}
