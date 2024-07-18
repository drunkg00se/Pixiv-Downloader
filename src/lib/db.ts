import Dexie, { type Table } from 'dexie';
import { logger } from './logger';

export interface HistoryData {
	pid: number;
	userId?: number;
	user?: string;
	title?: string;
	tags?: string[];
}

class HistoryDb extends Dexie {
	public history!: Table<HistoryData, number>;

	public constructor() {
		super('PdlHistory');
		this.version(2).stores({
			history: 'pid, userId, user, title, *tags'
		});
	}
}

function createHistoryDb() {
	const db = new HistoryDb();
	let record: Set<number>;

	logger.time('loadDb');
	db.history.toArray().then((datas) => {
		record = new Set(datas.map((data) => data.pid));
		logger.timeEnd('loadDb');
	});

	return {
		async add(historyData: HistoryData) {
			if (!(await this.has(historyData.pid))) {
				db.history.put(historyData);
				record.add(historyData.pid);
			}
		},

		bulkAdd(historyDatas: HistoryData[]) {
			const result = db.history.bulkPut(historyDatas);
			historyDatas.forEach((data) => {
				record.add(data.pid);
			});
			return result;
		},

		async has(pid: number | string): Promise<boolean> {
			if (typeof pid === 'string') pid = Number(pid);
			if (record) {
				return record.has(pid);
			} else {
				return !!(await db.history.get(pid));
			}
		},

		getAll(): Promise<HistoryData[]> {
			return db.history.toArray();
		},

		clear() {
			record && (record = new Set());
			return db.history.clear();
		}
	};
}

export const historyDb = createHistoryDb();
