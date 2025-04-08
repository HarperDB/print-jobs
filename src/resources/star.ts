import { Resource } from 'harperdb';
import { PrintJobStatus } from '../types/graphql.js';
import type { PrintJob } from '../types/graphql.js';
import { PrintJobTable } from '../constants/index.js';
import { getPrimaryKey } from '../util/primaryKey.js';
import type { IGetRequest, TResourceContext } from '../types/harper.js';
import { StarJobNotFound } from '../errors/index.js';
import type { IStarPostRequest } from '../types/star.js';
import { passThroughStarDelete } from '../util/requests.js';

export class Star extends Resource {
	async post(record: IStarPostRequest) {
		const uniquePrinterId = record.printerMAC;

		const jobsIterator = await PrintJobTable.get({
			conditions: [
				{
					attribute: 'uniquePrinterIdJobToken',
					comparator: 'starts_with',
					value: uniquePrinterId,
				},
				{
					attribute: 'status',
					comparator: 'equals',
					value: PrintJobStatus.Ready,
				},
			],
			limit: 1,
			select: ['starPollResponse'],
			sort: {
				attribute: 'createdAt',
				descending: false,
			},
		});

		let job: Pick<PrintJob, 'starPollResponse'> | null = null;
		for await (const record of jobsIterator) {
			job = record;
			break;
		}

		return { status: 200, headers: { 'Content-Type': 'application/json' }, data: job?.starPollResponse };
	}

	async get(req: IGetRequest) {
		const params = new URLSearchParams(req.url);
		const macAddress = params.get('mac')!;
		const jobToken = params.get('token')!;
		const uniquePrinterIdJobToken = getPrimaryKey(macAddress, jobToken);

		const job = (await PrintJobTable.get({
			id: uniquePrinterIdJobToken,
			select: ['jobData'],
		})) as unknown as Pick<PrintJob, 'jobData'> | null;

		if (!job?.jobData) {
			throw new StarJobNotFound();
		}

		PrintJobTable.patch(uniquePrinterIdJobToken, {
			status: PrintJobStatus.Fetched,
			fetchedAt: Date.now(),
		});

		return job.jobData;
	}

	async delete() {
		const context = this.getContext() as unknown as TResourceContext;
		const params = new URLSearchParams(context.url);
		const uniquePrinterIdJobToken = getPrimaryKey(params.get('mac'), params.get('token'));

		PrintJobTable.delete(uniquePrinterIdJobToken);
		passThroughStarDelete(params);

		return { status: 200 };
	}
}
