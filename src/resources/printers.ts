import { Resource } from 'harperdb';
import { PrinterType, PrintJobStatus } from '../types/graphql.js';
import { PrintJobTable, XML_CONTENT_TYPE } from '../constants/index.js';
import { extractPrintJobId } from '../util/regex.js';
import { getPrimaryKey } from '../util/primaryKey.js';
import type { IBufferData, TResourceContext } from '../types/harper.js';
import type { IStarPutRequest } from '../types/star.js';

export class Printers extends Resource {
	async put(req: IBufferData | IStarPutRequest) {
		const context = this.getContext() as unknown as TResourceContext;
		const uniquePrinterId = context.headers.get('uniqueprinterid');
		const contentType = context.headers.get('content-type');

		if (contentType === XML_CONTENT_TYPE) {
			const epsonPollResponse = req as IBufferData;
			const jobData = epsonPollResponse.data.toString('utf8');
			const jobToken = extractPrintJobId(jobData);
			const primaryKey = getPrimaryKey(uniquePrinterId, jobToken);

			PrintJobTable.put(primaryKey, {
				uniquePrinterIdJobToken: primaryKey,
				uniquePrinterId,
				jobToken,
				status: PrintJobStatus.Ready,
				printerType: PrinterType.Epson,
				jobData,
			});
		} else {
			const starPollResponse = req as IStarPutRequest;
			const jobToken = starPollResponse.jobToken;
			const primaryKey = getPrimaryKey(uniquePrinterId, jobToken);

			PrintJobTable.put(primaryKey, {
				uniquePrinterIdJobToken: primaryKey,
				jobToken,
				uniquePrinterId,
				status: PrintJobStatus.Ready,
				printerType: PrinterType.Star,
				starPollResponse,
			});
		}
	}
}
