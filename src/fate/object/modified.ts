import type {FateObject} from '../object';
import type {FateObjectExcluded} from './excluded';

export type FateObjectModified<T> = Partial<Omit<FateObject<T>, FateObjectExcluded>>;
