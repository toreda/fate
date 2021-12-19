import type {Expand} from '@toreda/types';
import type {FateObjectModified} from './object/modified';

export type FateOptions<T = unknown> = Expand<FateObjectModified<T> & {serialized?: string}>;
