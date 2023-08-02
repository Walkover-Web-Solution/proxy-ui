import { Component, Input } from '@angular/core';

@Component({
    selector: 'proxy-router-loader',
    template: `
        <div class="bg-white microservice-route-loader">
            <div class="w-100 p-3 text-left">
                <img
                    src="{{ 'assets/images/logo/proxy-logo.svg?' }}"
                    alt="proxy logo"
                    width="100"
                    height="50"
                    loading="lazy"
                />
            </div>
            <div class="d-flex flex-column align-items-center justify-content-center px-4" style="margin-top: 30vh;">
                <div class="d-flex align-items-center flex-wrap justify-content-center text-center">
                    <img
                        src="{{
                            'assets/images/microservice-icon/' +
                                (microserviceName | replace: ' ':'-' | lowercase) +
                                '.svg'
                        }}"
                        [alt]="microserviceName | replace: ' ':'-'"
                        class="mr-3 microservice-logo"
                        loading="lazy"
                    />
                    <p style="font-weight: 600; margin-top: 0px;" class="text-dark mb-2 pt-2 microservice-name">
                        {{ microserviceName | uppercase }}
                    </p>
                </div>
                <p class="text-dark-light my-0">Loading...</p>
            </div>
        </div>
    `,
    styleUrls: ['./router-loader.component.scss'],
})
export class RouterLoaderComponent {
    @Input() public microserviceName: string = '';
}
