import {Fate} from '../../fate';
import type {Records} from '@toreda/types';

/**
 * Create wrapped records object as Fate data.
 * @param records
 * @returns
 *
 * @category Records
 */
export function fateMakeRecords<T>(records?: T[] | null): Fate<Records<T>> {
	const initialRecords = Array.isArray(records) ? records : [];
	const initialCount = initialRecords.length;

	return new Fate<Records<T>>({
		data: {
			records: initialRecords,
			recordCount: initialCount
		}
	});
}
