import { tables } from 'harperdb';

export const { PrintJob: PrintJobTable } = tables;

export enum EpsonRequestType {
	GET = 'GetRequest',
	DELETE = 'SetResponse',
}

export const STAR_JOB_ENDPOINT = '/restservices/cwpos/v1/cloudPrintServices/printers';
export const EPSON_JOB_ENDPOINT = '/restservices/cwpos/v1/cloudPrinterServices/service/printers/epson';
export const XML_CONTENT_TYPE = 'application/xml';
