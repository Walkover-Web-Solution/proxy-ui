import { CreateRepeaterConfigurations, Meta } from '../repeater';

export interface TriggerResModel {
    id: number;
    segment_id: number;
    persistent_time: number;
    communication_type_id: number;
    configurations: CreateRepeaterConfigurations;
    meta: Meta;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
}
