import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
    MonacoEditorComponent,
    MonacoEditorConstructionOptions,
    MonacoEditorLoaderService,
    MonacoStandaloneCodeEditor,
} from '@materia-ui/ngx-monaco-editor';
import { keyValuePair } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { isEqual } from 'lodash-es';
import { filter, takeUntil } from 'rxjs/operators';

type PrimitiveType = string | number | boolean;
type emitOtherType = keyValuePair<PrimitiveType | keyValuePair<PrimitiveType>>;
type itemType = monaco.languages.CompletionItem;
type diagnosticsOptions = monaco.languages.json.DiagnosticsOptions;

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
    /** Store the instance of monaco editor.  */
    @ViewChild(MonacoEditorComponent, { static: false }) monacoComponent: MonacoEditorComponent | undefined;
    /** Code to show in editor, and used as two-way binding. */
    @Input() code: string = '';
    /** options for monaco editor to init */
    @Input() editorOptions: MonacoEditorConstructionOptions = {
        theme: 'vs-dark',
        language: 'javascript',
        suggest: {
            snippetsPreventQuickSuggestions: false,
        },
        minimap: {
            enabled: false,
        },
    };
    /*
     * Phone book name to add selectedPhoneBook.phonebook if phone
     * book in code input string, to be added on update time.
     * only for purpose of campaign editor options.
     */
    @Input() phoneBook: any;
    /** Key value pair to show suggestions on key hit in monaco editor */
    @Input() completionItemWithSignKey: { [key: string]: Array<itemType> };
    /** Provide code on content change in editor. */
    @Output() emitCode: EventEmitter<string> = new EventEmitter();
    /** Emit other value based on developer requirements. */
    @Output() emitOther: EventEmitter<emitOtherType> = new EventEmitter();
    /** Themes */
    @Input() themes = [
        { name: 'Visual Studio', value: 'vs' },
        { name: 'Visual Studio Dark', value: 'vs-dark' },
        { name: 'High Contrast Dark', value: 'hc-black' },
    ];
    /** Show Theme object. */
    @Input() showThemeDropdown: boolean = true;

    /** direct get form control, if passed then use it other wise ng model is used. */
    @Input() control: FormGroup<{ code: FormControl<any> }>;

    /** options to pass  setDiagnosticsOptions function for json default. */
    @Input() diagnosticsOptions: diagnosticsOptions;

    /** uri to use assign file name */
    // @Input() modelUri: monaco.Uri = monaco.Uri.parse("a://b/foo.json");

    /** Hold editor instance class field. */
    public editor: MonacoStandaloneCodeEditor | undefined;
    /*
     * Store selected phone book if add in editor
     * only for purpose of campaign editor options.
     */
    public selectedPhoneBook: { suggestion: any; phoneBook: any } = { suggestion: null, phoneBook: null };
    /** Store monaco editor command reference to use if suggestion clicked or enter */
    public command?: string | null;
    /**
     * Store monaco editor completion provider instance,
     * to be used to destroy completion.
     */
    public completionProvider: monaco.IDisposable;

    private isMonacoLoaded: boolean = false;
    /** We used it to give name of our editor*/
    public modelUri: any;

    constructor(private monacoLoaderService: MonacoEditorLoaderService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {}

    /**
     * Call back when editor initialize first time.
     *
     * @param {MonacoStandaloneCodeEditor} editor object of editor instance
     */
    public editorInit(editor: MonacoStandaloneCodeEditor): void {
        this.editor = editor;
        this.editor.getModel().onDidChangeContent((e) => {
            this.emitCode.emit(this.editor.getValue() || '');
        });
        this.monacoLoaderServiceCall();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.hasOwnProperty('code')) {
            this.emitCode.emit(this.code);
        }
        if (changes.hasOwnProperty('phoneBook')) {
            if (!changes.phoneBook.previousValue && changes.phoneBook.currentValue) {
                this.selectedPhoneBook.phoneBook = changes.phoneBook.currentValue;
            }
        }

        if ('completionItemWithSignKey' in changes) {
            if (
                !isEqual(
                    changes?.completionItemWithSignKey?.currentValue,
                    changes?.completionItemWithSignKey?.previousValue
                ) &&
                this.isMonacoLoaded &&
                this.completionItemWithSignKey &&
                Object.keys(this.completionItemWithSignKey)?.length
            ) {
                this.completionProvider?.dispose();
                this.showSuggestions();
            }
        }
    }

    public ngOnDestroy(): void {
        /** check if dispose available in completion provider to remove suggestions. */
        if (typeof this.completionProvider?.dispose === 'function') {
            this.completionProvider.dispose();
        }
        /** if editor instance is available then remove editor properly. */
        if (this.editor) {
            this.editor.dispose();
            this.editor = undefined;
        }
        super.ngOnDestroy();
    }

    /**
     * Update monaco options.
     *
     * @param {MonacoEditorConstructionOptions} options
     */
    public updateMonacoOptions(options: MonacoEditorConstructionOptions) {
        this.editor.updateOptions(options);
    }

    /**
     * Use to subscribe monaco service load.
     */
    public monacoLoaderServiceCall(): void {
        this.monacoLoaderService.isMonacoLoaded$
            .pipe(
                filter((isLoaded) => Boolean(isLoaded)),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.registerCommandForSuggestionSelection();
                this.isMonacoLoaded = true;
                // if (this.completionItemWithSignKey && Object.keys(this.completionItemWithSignKey)?.length) {
                //     this.showSuggestions();
                // }
                if (this.diagnosticsOptions && Object.keys(this.diagnosticsOptions)?.length) {
                    this.setDiagnosticsOptions(this.diagnosticsOptions);
                }
            });
    }

    /**
     * Register command for click or enter(key) on suggestion select.
     */
    public registerCommandForSuggestionSelection(): void {
        let storeThis = this;
        this.command = this.editor?.addCommand(0, function (context, ...args) {
            if (args[1] === '$') {
                storeThis.assignToVariable(args[0]);
            }
        });
    }

    /**
     * Use to add selected phone book and selected item locally.
     * emit this value as other value to manage in parent.
     *
     * @param {itemType} item
     */
    public assignToVariable(item: itemType): void {
        const findPhoneBook = this.completionItemWithSignKey['$'].find(
            (phoneBook: any) => phoneBook.label === (item.label as string)
        );
        if (findPhoneBook?.label) {
            const splitted = (item.label as string).split('_');
            this.selectedPhoneBook.phoneBook = splitted[0];
            this.selectedPhoneBook.suggestion = item;
            this.emitOther.emit({
                phoneBook: splitted[0],
                field: item['field'],
            });
        }
    }

    /**
     * Use to register completion provider on key hit defined in class input property completionItemWithSignKey
     */
    public showSuggestions(): void {
        this.completionProvider = monaco.languages.registerCompletionItemProvider('javascript', {
            triggerCharacters: Object.keys(this.completionItemWithSignKey),
            provideCompletionItems: (model, position) => {
                const wordUntilPosition = model.getWordUntilPosition(position);
                if (this.completionItemWithSignKey[wordUntilPosition.word.trim()]) {
                    let dataByWord = this.completionItemWithSignKey[wordUntilPosition.word.trim()] || [];
                    const label = this.selectedPhoneBook.phoneBook;
                    if (label && wordUntilPosition.word.trim() === '$') {
                        const findExisting = this.editor
                            ?.getModel()
                            ?.findMatches(`$${label}`, true, false, false, null, false, 1);
                        if (findExisting?.length) {
                            dataByWord = this.completionItemWithSignKey[wordUntilPosition.word.trim()].filter(
                                // Removed '_<field>' for strict Checking in phoneBook.label for Phonebook name
                                (phoneBook: any) => phoneBook.label.replace(`_${phoneBook.field}`, '') === label
                            );
                        } else {
                            dataByWord = this.completionItemWithSignKey[wordUntilPosition.word.trim()];
                        }
                    }
                    const suggestions = dataByWord.map((data: any) => {
                        return {
                            ...data,
                            command: {
                                id: this.command,
                                title: 'inserted',
                                arguments: [data, wordUntilPosition.word.trim()],
                            },
                            range: {
                                startLineNumber: position.lineNumber,
                                startColumn: wordUntilPosition.startColumn + 1,
                                endLineNumber: position.lineNumber,
                                endColumn: wordUntilPosition.endColumn,
                            },
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        };
                    });
                    return { suggestions: suggestions };
                }
                return { suggestions: [] };
            },
        });
    }

    public setEditorTheme(value: string) {
        this.updateMonacoOptions({
            theme: value,
        });
    }

    /**
     * method to set up the validation options for JSON language.
     * Here, we enable validation and provide the schema
     * @param {diagnosticsOptions} options
     */
    public setDiagnosticsOptions(options: diagnosticsOptions) {
        this.modelUri = monaco.Uri.parse('a://b/city.json');
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options);
        this.changeDetectorRef.detectChanges();
    }
}
