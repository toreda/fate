import {Expand} from '@toreda/types';
import {FateObject} from './object';

export type FateObjectExcluded = 'errorLog' | 'messageLog' | 'status' | 'errorCode' | 'success' | 'executed';
export type FateObjectModified<T> = Partial<Omit<FateObject<T>, FateObjectExcluded>>;

export type FateOptions<T = unknown> = Expand<FateObjectModified<T> & {serialized?: string}>;
