# Proxy UI Design Guide

##   Setup Guide

1. Clone https://github.com/Walkover-Web-Solution/proxy-UI.git.

2. This project requires Node version 14+, install Node from [here](https://nodejs.org/en/).

3. Go inside the cloned directory `proxy-UI` in any terminal and run these following commands in the terminal to install dependency and start local serve.

4. Run `npm i` for installation of dependencies.

5. Serving the project locally: 
    * For proxy: Run `npm start` to local serve the project.
    * For Admin Panel: Run `npm run start:admin` to local serve the project.
    * For chat-widget: Run `npm run start:chat-widget` to local serve the project.
    * For otp-provider: Run `npm run start:otp-provider` to local serve the project.

## Prerequisites
It is important to have a thorough understanding of **HTML**, **CSS** and its pre-processor **SASS** to contribute to this project. If unaware of any of the above then go through their documention first.
* [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
* [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
* [SASS](https://sass-lang.com/documentation/).
* [Layout Rules](http://smacss.com/book/type-layout)


## Syntax and Formatting

### Naming Variables
When developing a convention for naming variables, it’s useful to think of variables in terms of how they relate to each other, and also to their roles and conventions in the real world. It is important to follow the cohesive naming convention, to have the better maintainability and readability of the code.

```css
/* Variable declaration */

--dark-primary-text: rgba(black, 0.87);
--dark-secondary-text: rgba(black, 0.54);
--dark-disabled-text: rgba(black, 0.38);

/* How to use varibales */

.text-color {
    color: var(--dark-primary-text);
}

```

Note: Know more about [CSS Variables](https://www.w3schools.com/css/css3_variables.asp)

#### Class Naming
1. Use meaningful or generic class names.

2. Instead of cryptic names, always use class names that reflect the purpose of the element in question, or that are otherwise generic.

3. Generic names are simply a fallback for elements that have no particular or no meaning different from their siblings. They are typically needed as “helpers".

4. Using functional or generic names reduces the probability of unnecessary document or template changes.

5. Use class names that are as short as possible but as long as necessary.Try to convey what a class is about while being as brief as possible.


```css
    /* Not recommended: meaningless */
    .yee-1901 {}
    .boo-doo {}

    /* recommended: presentational */
    .nav {}
    .btn-green {}
    .clear {}
```

#### ID Selectors
1. **`Avoid ID selectors`**.

2. ID attributes are expected to be unique across an entire page, which is difficult to guarantee when a page contains many components worked on by many different engineers. Class selectors should be preferred in all situations.

```css
/* Not recommended */
#example {}

/* Recommended */
.example {}

```

#### Shorthand Properties
1. Use shorthand properties where possible.

2. CSS offers a variety of shorthand properties (like font) that should be used whenever possible, even in cases where only one value is explicitly set.

3. Using shorthand properties is useful for code efficiency and understandability.

#### Important Declarations (!important)

1. **`Use '!important' declarations only if necessary`**.

2. In CSS, important means that only the !important property value is to be applied to an element and all other declarations on the element are to be ignored. In other words, an important rule can be used to override other styling rules in CSS.

3. However, there are specific use cases in which using the !important property is ideal. One such use case is overriding the default CSS of angular material.

```css
/* Use if needed */
.text-bold {
    font-weight: 700 !important;
}
```
#### Naming convention that we follow

1. Names are written in lowercase Latin letters.

2. Words are separated by a hyphen (-).

3. The block name defines the namespace for its elements and modifiers.

4. Include one line comment if needed to give the insight about the class/Id.

``` css
/*
// Domain Placeholder Card
*/
.domain-placeholder-card {
    .mat-card {
        padding-top: 46px;
        padding-bottom: 46px;
    }
}

/*
// No data for graph
*/

.no-data-placeholder {
    font-weight: 500;
    font-size: var(--font-size-common-14);
    line-height: 18px;
    text-align: center;
    color: var(--color-common-grey) !important;
    align-items: center;
    img {
        margin-bottom: 25px;
    }
}
```

#### Available breakpoints

| Breakpoint         | Class Infix    | Dimension  |
| -----------------  | -------------- | ---------- |
| X-small            |     None       |  <576px    |    
| Small              |     sm         |  >= 576px  |
| Medium             |     md         |  >= 768px  |
| Large              |     lg         |  >=992px   |
| Extra large        |     xl         |  >=1200px  |
| Extra extra large  |     xxl        |  >=1440px  |

```
Important note: We have defined a lots of utility classes in our global scss files. Example: '.status, .status-pending, .permission-step and so on.'
Try to use these utility classes instead of rewriting the CSS from scratch for any component and if theses utility class are not sufficient enough to design your template, then feel free to provide the CSS in the style file of the component.
```

## Folder/Files Architecture

`Note: Split the codebase into meaningful separated folders so it is easy to find stuff later when you have to come back to the code.`

### Global Styles Architecture

We have all our partials stuffed into 6 different folders, and a single file at the root level (styles.scss in our case) which imports them all to be compiled into a CSS stylesheet.

* base/
* components/
* froala/
* layouts/
* stripo/
* theme/

`Note: If in future project uses a lot of CSS animations, you might consider adding an \_animations.scss file in there containing the @keyframes definitions of all your animations. If you only use them sporadically, let them live along the selectors that use them.`

`Note: Your partials files could be less or more according to your application's need. For example: we have 6 in our case but it could be more if needed.`

Ideally, we can come up with something like this:

```
scss/
|
|– base/
|   |– dark-theme.scss   # Dark theme rules
|   |– default-variables.scss   # default vaiables rules
|   |– _fonts.scss   # Typography rules
|   |– light-theme.scss   # Light theme rules
|   |– _reset.scss        # Reset/normalize
|  
|
|– components/
|   |– _buttons.scss      # Buttons
|   |– _card.scss     # Carousel
|   |– _chart.scss        # Cover
|   |– _chip.scss     # Chip
|   |– _colors.scss      # Colors
|   |– _data-placeholder.scss     # Data Placeholders
|   |– _date-picker.scss        # Date Picker
|   |– _expansion-panel.scss     # Expansion Panel
|   |– _filters.scss      # Filters
|   |– _froala-editor-fields.scss     # Froala Editor
|   |– _icon.scss        # Icons
|   |– _loader.scss     # Loader
|   |– _menu.scss      # Menus
|   |– _modal.scss     # Modal
|   |– _pagination.scss        # Pagination
|   |– _select-option.scss     # Select Options
|   |– _side-dialog.scss      # Side Dialog
|   |– _status.scss     # Statues
|   |– _stepper.scss        # Stepper
|   |– _table.scss     # Table
|   |– _text-style.scss     # Text Styles
|   |– _toast.scss     # Toast
|
|– layout/
|   |– _display.scss   # Display Properties
|   |– _flex.scss         # Flexbox Properties
|   |– _grid.scss       # CSS Grid Properties
|   |– _positions.scss       # Positions
|   |– _sizings.scss      # Width and Height
|   |– _spacings.scss        # Spacing between elements
|   |– _text.scss        # Text Formattings
|
|– froala/
|   |– _froala.scss         # Froala editor specific styles
|
|– theme/
|   |– _default-theme.scss        # Default theme
|   |– _theme-colors.scss        # Theme colors
|   |– _typography-colors.scss        # Text styles
|
|– Stripo/
|   |– _stipo-template-preview.scss    # Stripo specific styles
|
`– styles.scss      
```

#### BASE FOLDER
The `base/` folder holds what we might call the boilerplate code for the project. In there, you might find the reset file, some typographic rules, and probably a stylesheet defining some standard styles for commonly used HTML elements (that we like to call _base.scss).

#### LAYOUT FOLDER
The `layout/` folder contains everything that takes part in laying out the site or application. This folder could have stylesheets for the main parts of the site (header, footer, navigation, sidebar…), the grid system or even CSS styles for all the forms.

#### COMPONENTS FOLDER
For smaller components, there is the `components/` folder. While layout/ is macro (defining the global wireframe), `components/` is more focused on widgets. It contains all kind of specific modules like a date-picker, a loader, a filter, and basically anything along those lines. There are usually a lot of files in components/ since the whole site/application should be mostly composed of tiny modules.

#### THEME FOLDER
On large sites and applications, it is not unusual to have different themes. There are certainly different ways of dealing with themes but we personally like having them all in a `themes/` folder.

#### FROALA & STRIPO FOLDERS
There we have kept all the froala and stripo specific styles.

### Component Level Styles

For every Angular component you write, you can define not only an HTML template, but also the CSS styles that go with that template, specifying any selectors, rules, and media queries that you need.

#### Component styling best practices

You should consider the styles of a component to be private implementation details for that component. When consuming a common component, you should not override the component's styles any more than you should access the private members of a TypeScript class. While Angular's default style encapsulation prevents component styles from affecting other components, global styles affect all components on the page.

### Predefined layout

#### 1. Table

``` html
/*
// Default layout
*/

<table mat-table [dataSource]="dataSource" class="default-table">
  <!-- Position Column -->
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef> No. </th>
    <td mat-cell *matCellDef="let element"> {{element.position}} </td>
  </ng-container>

   <tr mat-header-row *matHeaderRowDef="displayedColumns;sticky: true;"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>

/*
// Responsive layout
// Add data-label attribute inside th tag
*/

<table mat-table [dataSource]="dataSource" class="default-table responsive-table">
  <!-- Position Column -->
  <ng-container matColumnDef="position">
    <th mat-header-cell *matHeaderCellDef data-label="No."> No. </th>
    <td mat-cell *matCellDef="let element"> {{element.position}} </td>
  </ng-container>

   <tr mat-header-row *matHeaderRowDef="displayedColumns;sticky: true;"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>

/*
// Default & Responsive layout with scroll
*/
<div class="table-scroll">
    <table mat-table [dataSource]="dataSource" class="default-table responsive-table">
    <!-- Position Column -->
    <ng-container matColumnDef="position">
        <th mat-header-cell *matHeaderCellDef data-label="No."> No. </th>
        <td mat-cell *matCellDef="let element"> {{element.position}} </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns;sticky: true;"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
</div>
```


#### 2. Sorting Table columns

##### For Desktop View:

* In desktop view the filter options for tabel column is given just beside the column heading (represented by an arrow). By hovering over the heading you can see it appear and by clicking on it you can toggle the data from ascending to descending(or vice-versa).

![desktop view filter](./apps/proxy/src/assets/images/snaps/desktop-view-filter.png).

##### For Mobile View:

* In mobile view we are changing the layout to card format and placing the filter arrow beside the column title was not feasible(or user friendly), hence for this purpose we are providing a sort button at top of the cards beside other buttons.

![sort button](./apps/proxy/src/assets/images/snaps/sort%20button%20in%20mobile%20view.png).

`Note: I have highlighted the button with yellow color to let you know which sort buttom I am talking about.`

* By clicking on the sort button you can see a modal opening up from the bottom and inside of the modal the sort options are specified.

##### How to implement the sort functionality in mobile view.

* First, you have to include a button in template file which will only be visible in mobile view. This button will trigger a function which in return will open up modal with the specified sort options.

``` html
/** Template File */

 <button mat-stroked-button class="ml-2 bottom-sort-btn  mat-btn-xs" (click)="sortBottomSheet()">
    <mat-icon class="mat-icon-20">sort</mat-icon> <span class="hide-xs ml-1">Sort</span>
</button>

```

``` javascript

/** TS File */
public sortBottomSheet(): void {
        const bottomSheetRef = this.bottomSheet.open(SortingBottomSheetComponent, {
            panelClass: ['sort-bottom-sheet'],
            data: { columnsName: this.sortColumns, sortBy: this.sortBy, sortOrder: this.sortOrder },
        });
        bottomSheetRef.afterDismissed().subscribe((result) => {
            if (result) {
                const payload = { active: result.key, direction: result.value };
                this.sortData(payload);
            }
        });
    }

```

### Miscellaneous

#### 1. Button

| Class Name                           | Preview                                                                                 |
| -------------------------------------|-----------------------------------------------------------------------------------------|
| `mat-flat-button flat-default`       | ![desktop view filter](./apps/proxy/src/assets/images/snaps/flat-default-btn.jpg)       |         
| `mat-flat-button flat-primary-light` | ![desktop view filter](./apps/proxy/src/assets/images/snaps/flat-primary-light.jpg)     |         
| `mat-icon-button mat-icon-sm`        | ![desktop view filter](./apps/proxy/src/assets/images/snaps/mat-icon-sm.jpg)            |        
| `mat-icon-button icon-btn-md`        | ![desktop view filter](./apps/proxy/src/assets/images/snaps/icon-btn-md.jpg)            |         
| `mat-icon-button`                    | ![desktop view filter](./apps/proxy/src/assets/images/snaps/mat-icon-button.png)        |         
| `mat-icon-button mat-primary`        | ![desktop view filter](./apps/proxy/src/assets/images/snaps/mat-icon-button.png)        |        
| `mat-icon-button mat-warn`           | ![desktop view filter](./apps/proxy/src/assets/images/snaps/icon-warn-btn.jpg)          |        
| `mat-btn-md`                         | ![desktop view filter](./apps/proxy/src/assets/images/snaps/mat-btn-md.jpg)             |        
| `mat-btn-sm`                         | ![desktop view filter](./apps/proxy/src/assets/images/snaps/mat-btn-sm.jpg)             |        
| `custom-toggle-btn`                  | ![desktop view filter](./apps/proxy/src/assets/images/snaps/custom-toggle-btn.jpg)      | 
| `default-toggle-btn`                 | ![desktop view filter](./apps/proxy/src/assets/images/snaps/default-toggle-btn.jpg)     | 

#### 2. Card

| Class Name                           | Preview                                                                                 |
| -------------------------------------|-----------------------------------------------------------------------------------------|
| `mat-data-card outline-card`         |   <img src="./apps/proxy/src/assets/images/snaps/outline-card.jpg" width="350">
| `mat-data-card delivered`            |   <img src="./apps/proxy/src/assets/images/snaps/delivered-card.jpg" width="350">       |
| `mat-data-card suppressed`           |   <img src="./apps/proxy/src/assets/images/snaps/suppressed.jpg" width="350">       |
| `mat-data-card open`                 |   <img src="./apps/proxy/src/assets/images/snaps/open-card.jpg" width="350">       |
| `mat-data-card failed`               |   <img src="./apps/proxy/src/assets/images/snaps/failed-card.jpg" width="350">       |
| `mat-data-card others`               |   <img src="./apps/proxy/src/assets/images/snaps/others-card.jpg" width="350">       |
| `mat-data-card inprogress`           |   <img src="./apps/proxy/src/assets/images/snaps/inprogress-card.jpg" width="350">       |
| `mat-data-card total`                |   <img src="./apps/proxy/src/assets/images/snaps/total-card.jpg" width="350">       |

#### 3. Chip

| Class Name                           | Preview                                                                                 |
| -------------------------------------|-----------------------------------------------------------------------------------------|
| `mat-chip-outlined` `mat-chip-md` | ![desktop view filter](./apps/proxy/src/assets/images/snaps/chip.jpg) 
      
#### 4. Colors

| Class Name                                                                                                            
| -------------------------------------
| `bg-white` `bg-light-grey` `bg-grey` `bg-green` `bg-transparent`

#### 5. Expansion

| Class Name                           | Preview                                                                                 |
| -------------------------------------|-----------------------------------------------------------------------------------------|
| `custom-expansion-panel`             | <img src="./apps/proxy/src/assets/images/snaps/custom-expansion-panel.jpg" width="500"> |

#### 6. Icons Size

| Class Name                           
| -------------------------------------------------------------------------------------------------------------------------------
| `mat-icon-12` `mat-icon-14` `mat-icon-16` `mat-icon-18` `mat-icon-20` `mat-icon-22` `mat-icon-24`

#### 7. Text style

| Title            | Class Name                                                                                                  |  
| -----------------|-------------------------------------------------------------------------------------------------------------|
| Opacity          | `t-opacity-5` `t-opacity-6` `t-opacity-7` `t-opacity-8` `t-opacity-9`
| Color            | `text-muted` `text-white` `text-dark` `text-secondary` `text-success` `text-danger` `text-primary` `text-pending` `text-grey` `text-hover-primary` `text-warnin`
| Size             | `--font-12` `--font-14`
| Weight           | `fw-thin` `fw-regular` `fw-bold` `fw-bolder` `fw-normal` 
| Word Break       | `word-break`
| Word Break with dash(-) | `w-b-hyphens`
| Alignment        | `text-left` `text-right` `text-center`

#### 8. Formfields

| Title            | Class Name                                                                                                  |  
| -----------------|-------------------------------------------------------------------------------------------------------------|
| Remove Padding fron form field                                                | `no-padding`
| Combine Mat Select and textarea into one filed for SMS Content                | `filed-textarea-select-group`
| Combine Mat Select and input into one filed used in integration dialog html   | `group-form-inputs`
| For error                                                                     | `mat-error`
| Disabled form filed                                                           | `form-field-disabled`
| Remove border                                                                 | `form-field-no-border`

#### 9. Center & Side Dailog Size

| Size                                  | Class Name                                                                              |
| --------------------------------------|-----------------------------------------------------------------------------------------|
| Large Dialog                          | `mat-dialog-lg`
| Medium Dialog                         | `mat-dialog-md`
| Auto width Dialog                     | `mat-dialog-aut`
| Extra Large Dialog                    | `mat-dialog-xlg`
| Email Template Dialog                 | `templatePreview`
| Side Dialog medium                    | `mat-dialog-md`
| Side Dialog small                     | `mat-dialog-xs`
| Side Dialog large                     | `mat-dialog-lg`
| Side Dialog Extra large               | `mat-dialog-xlg`



#### 3. Status Class

| Class Name                           | Preview                                                                                 |
| -------------------------------------|-----------------------------------------------------------------------------------------|
| `status` `status-default` `status-pending` `status-success` `status-failed` `status-success` `status-approved` | ![desktop view filter](./apps/proxy/src/assets/images/snaps/status.jpg)       | 


