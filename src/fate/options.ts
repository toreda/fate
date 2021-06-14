import {Expand} from '@toreda/types';
import {FateObject} from './object';

type FateObjectExcluded = 'errorLog' | 'messageLog' | 'status';
type FateObjectModified<T> = Partial<Omit<FateObject<T>, FateObjectExcluded>>;

export type FateOptions<T = unknown> = Expand<FateObjectModified<T> & {serialized?: string}>;
