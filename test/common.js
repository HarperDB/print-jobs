import 'dotenv/config';

const HOST = process.env.TEST_REST_HOST;
const AUTH = process.env.TEST_USE_AUTH;
const USERNAME = process.env.TEST_REST_USERNAME;
const PASSWORD = process.env.TEST_REST_PASSWORD;
const TOKEN = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export const PRINTERS_ENDPOINT = '/restservices/cwpos/v1/cloudPrinterServices/service/printers';
export const STAR_ENDPOINT = '/restservices/cwpos/v1/cloudPrinterServices/printers';
export const EPSON_ENDPOINT = '/restservices/cwpos/v1/cloudPrinterServices/service/printers/epson';

export const FAKE_STAR_MAC = '00:11:62:0e:48:a7';
export const FAKE_STAR_JOB_TOKEN = '1738946726625';
export const FAKE_STAR_DATA = {
	jobReady: true,
	mediaTypes: [
		'application/vnd.star.line',
		'application/vnd.star.linematrix',
		'application/vnd.star.starprnt',
		'application/vnd.star.starprntcore',
		'text/vnd.star.markup',
	],
	jobToken: FAKE_STAR_JOB_TOKEN,
};

export const FAKE_EPSON_ID = 'X6WY351989';
export const FAKE_EPSON_JOB_TOKEN = '1738944642280';

export const fetchWrapper = async (url, options) => {
	if (AUTH === 'true') {
		options.headers ??= {};
		options.headers.Authorization = `Basic ${TOKEN}`;
	}

	return await fetch(url, options);
};

export const getPrintJobById = async (uniquePrinterId, jobToken) => {
	const url = `${HOST}/print-job/${uniquePrinterId}.${jobToken}`;

	try {
		const options = {
			method: 'GET',
		};
		const resp = await fetchWrapper(url, options);
		const data = await resp.json();
		return data;
	} catch (e) {
		console.log(e);
		return -1;
	}
};
