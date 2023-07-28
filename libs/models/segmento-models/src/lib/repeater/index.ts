import { keyValuePair } from '@msg91/models/root-models';

export interface RepeaterFrequenciesResModel {
    id: number;
    name: string;
    configurations: Configurations;
}

export interface Configurations {
    setup: Setup;
}

export interface Setup {
    fields: ConfigurationsField[];
}

export interface ConfigurationsField {
    name: string;
    type: string;
    label: string;
    rules: string[];
    multivalue: boolean;
    is_required: boolean;
    options?: any[];
    prefix_label: string;
    placeholder?: string;
}

export interface CreateRepeaterReqModel {
    communication_type_id: number;
    repeater_frequency_id: number;
    start_date: string;
    end_date?: string;
    configurations: CreateRepeaterConfigurations;
    frequency_configurations: FrequencyConfigurations;
    meta: Meta;
}

export interface CreateRepeaterConfigurations {
    mappings?: Mappings;
    setup: CreateRepeaterSetup;
}

export interface CreateRepeaterFields {
    mapping?: Mapping[];
    variables?: string[];
}

export interface Mapping {
    name: string;
    type: string;
    label: string;
    regex: string;
    source: string;
    is_array: boolean;
    is_required: boolean;
    sourceFieldLabel: string;
    sourceFieldValue: string;
}

export interface FrequencyConfigurations {
    setup: CreateRepeaterSetup;
}

export interface Meta {
    campaign_slug: Setup;
    fields?: CreateRepeaterFields;
}

export interface CreateRepeaterSetup {
    [key: string]: keyValuePair<string | keyValuePair<string>>;
}

export interface Mappings {
    [key: string]: keyValuePair<string | keyValuePair<string>>;
}

export type RepeaterStatus = Pick<RepeaterFrequenciesResModel, 'id' | 'name'>;
