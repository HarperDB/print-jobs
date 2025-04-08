import { Resource } from 'harperdb';
import type { PrintJob } from '../types/graphql.js';
import { PrintJobStatus } from '../types/graphql.js';
import { extractPrintJobId } from '../util/regex.js';
import { getPrimaryKey } from '../util/primaryKey.js';
import { EpsonRequestType, PrintJobTable } from '../constants/index.js';
import type { IEpsonDeleteRequest, IEpsonPostRequest } from '../types/epson.js';
import { passThroughEpsonDelete } from '../util/requests.js';

const handleGet = async (record: IEpsonPostRequest) => {
	const uniquePrinterId = record.Name;

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
		select: ['uniquePrinterIdJobToken', 'jobData'],
		sort: {
			attribute: 'createdAt',
			descending: false,
		},
	});

	let job: Pick<PrintJob, 'uniquePrinterIdJobToken' | 'jobData'> | null = null;
	for await (const record of jobsIterator) {
		job = record;
		break;
	}

	if (job) {
		PrintJobTable.patch(job.uniquePrinterIdJobToken, { status: PrintJobStatus.Fetched, fetchedAt: Date.now() });
	}

	return { status: 200, headers: { 'Content-Type': 'text/xml' }, body: job?.jobData };
};

const handleDelete = (record: IEpsonDeleteRequest) => {
	const uniquePrinterId = record.Name;
	const jobToken = extractPrintJobId(record.ResponseFile);
	const uniquePrinterIdJobToken = getPrimaryKey(uniquePrinterId, jobToken);

	PrintJobTable.delete(uniquePrinterIdJobToken);
	passThroughEpsonDelete(record);

	return { status: 200 };
};

export class Epson extends Resource {
	async post(record: IEpsonPostRequest | IEpsonDeleteRequest) {
		if (record.ConnectionType === EpsonRequestType.GET) {
			return await handleGet(record);
		}

		return handleDelete(record);
	}
}
