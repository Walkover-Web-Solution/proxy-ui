import { GradientColorObject, PatternObject } from 'highcharts';

export interface StackedBarChartOptions {
    title: { [key: string]: string }; // The chart's main title.
    xAxis: IXAxis; // The X axis or category axis. the xAxis node is an array of configuration objects.
    yAxis: IYAxis; // The yAxis node is an array of configuration objects.
    plotOptions: IPlotOptions; // The plotOptions is a wrapper object for config objects for each series type.
    tooltip: any; // Options for the tooltip that appears when the user hovers over a series or point.
    series: SingleSeriesData[]; // Series options for specific data and the data itself.
}
export interface IXAxis {
    title: { [key: string]: string }; //Title of xAxis
    type: string; // linear | logarithmic | datetime | category
    labels: any; // The axis labels show the number or category for each tick.
    categories:
        | string[]
        | Date[] /** If categories are present for the xAxis, names are used instead of numbers for that axis. */;
}

export interface IYAxis {
    allowDecimals?: boolean; // Whether to allow decimals in this axis' ticks.;
    min?: number; // The minimum value of the axis
    title: { [key: string]: string }; // The axis title
}

export interface IPlotOptions {
    column: Column; // Column series display one column per value along an X axis.
    series: { [key: string]: { [key: string]: boolean } }; // General options for all series types.
}

export interface Column {
    stacking: string; // Whether to stack the values of each series on top of each other. Possible values are 'undefined' to disable, "normal" to stack by value or "percent"
    grouping: boolean; // Whether to group non-stacked columns or to let them render independent of each other
}

export interface SingleSeriesData {
    type: 'column' | 'line'; // Chart type
    name: string; // The name of the series as shown in the legend, tooltip etc.
    data: number[]; // An array of data points for the series
    stack?: string | number; // Two or more bar data with same "stack" will stack on each other.
    marker?: Marker; // Defines the visual appearance of the markers.
}

export interface Marker {
    lineWidth: number; // The width of the point marker's outline.
    lineColor: string | GradientColorObject | PatternObject; // The color of the point marker's outline
    fillColor: string; // The color of the point marker's outline
}
