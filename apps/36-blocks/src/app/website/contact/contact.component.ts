import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';

export type ContactCategory = 'General' | 'Billing' | 'Security' | 'Integration' | 'Other';

export interface ContactFormPayload {
    name: string;
    email: string;
    category: ContactCategory;
    subject: string;
    message: string;
    submittedAt: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-contact',
    imports: [ScrollRevealDirective, ReactiveFormsModule],
    templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);
    private readonly formBuilder = inject(FormBuilder);

    public readonly categories: ContactCategory[] = ['General', 'Billing', 'Security', 'Integration', 'Other'];

    public readonly contactForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email]],
        category: ['General' as ContactCategory, Validators.required],
        subject: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
        message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    });

    public readonly submitted = signal(false);
    public readonly submitSuccess = signal(false);

    public ngOnInit(): void {
        this.titleService.setTitle('Contact — 36Blocks');
        this.metaService.updateTag({
            name: 'description',
            content:
                'Get in touch with the 36Blocks team. Contact us for support, billing enquiries, security disclosures, or developer documentation.',
        });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
        this.metaService.updateTag({ property: 'og:title', content: 'Contact — 36Blocks' });
        this.metaService.updateTag({
            property: 'og:description',
            content: 'Reach the 36Blocks team for support, billing, and security.',
        });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    public isFieldInvalid(fieldName: string): boolean {
        const control = this.contactForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
    }

    public submitContactForm(): void {
        this.submitted.set(true);

        if (this.contactForm.invalid) {
            this.contactForm.markAllAsTouched();
            return;
        }

        const formValues = this.contactForm.getRawValue();
        const payload: ContactFormPayload = {
            name: formValues.name ?? '',
            email: formValues.email ?? '',
            category: (formValues.category as ContactCategory) ?? 'General',
            subject: formValues.subject ?? '',
            message: formValues.message ?? '',
            submittedAt: new Date().toISOString(),
        };

        // TODO: replace with API call, e.g. this.contactService.submit(payload)
        console.group('%c📬 Contact Form Submission', 'color: #2dd4bf; font-weight: bold; font-size: 14px;');
        console.log('%cName:     ', 'color: #8b949e; font-weight: bold;', payload.name);
        console.log('%cEmail:    ', 'color: #8b949e; font-weight: bold;', payload.email);
        console.log('%cCategory: ', 'color: #8b949e; font-weight: bold;', payload.category);
        console.log('%cSubject:  ', 'color: #8b949e; font-weight: bold;', payload.subject);
        console.log('%cMessage:  ', 'color: #8b949e; font-weight: bold;', payload.message);
        console.log('%cTimestamp:', 'color: #8b949e; font-weight: bold;', payload.submittedAt);
        console.log('%cFull payload:', 'color: #8b949e; font-weight: bold;', payload);
        console.groupEnd();

        this.submitSuccess.set(true);
        this.contactForm.reset({ category: 'General' });
        this.submitted.set(false);
    }
}
