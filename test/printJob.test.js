import 'dotenv/config';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
	fetchWrapper,
	getPrintJobById,
	FAKE_STAR_DATA,
	FAKE_STAR_MAC,
	FAKE_EPSON_ID,
	FAKE_STAR_JOB_TOKEN,
	FAKE_EPSON_JOB_TOKEN,
	PRINTERS_ENDPOINT,
	EPSON_ENDPOINT,
	STAR_ENDPOINT,
} from './common.js';

const HOST = process.env.TEST_REST_HOST;

describe('STAR printer flow', () => {
	describe('Add new print job', () => {
		it('it should execute a successful HTTP request', async () => {
			const url = `${HOST}${PRINTERS_ENDPOINT}`;

			try {
				const options = {
					method: 'PUT',
					headers: {
						'Content-type': 'application/json',
						'uniquePrinterId': FAKE_STAR_MAC,
					},
					body: JSON.stringify(FAKE_STAR_DATA),
				};
				const resp = await fetchWrapper(url, options);
				assert.strictEqual(resp.status, 204);
			} catch (e) {
				assert.ok(false);
			}
		});

		it('it should have inserted a new job', async () => {
			const job = await getPrintJobById(FAKE_STAR_MAC, FAKE_STAR_JOB_TOKEN);

			assert.equal(job.jobToken, FAKE_STAR_JOB_TOKEN);
			assert.equal(job.uniquePrinterId, FAKE_STAR_MAC);
			assert.equal(job.status, 'ready');
			assert.equal(job.printerType, 'star');
		});
	});

	describe('Printer polls for print job', () => {
		let pollResponse;

		it('it should execute a successful HTTP request', async () => {
			const url = `${HOST}${STAR_ENDPOINT}`;

			try {
				const options = {
					method: 'POST',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({
						status: '23 6 4 0 0 0 0 0 0 ',
						printerMAC: FAKE_STAR_MAC,
						statusCode: '200%20OK',
						printingInProgress: false,
						clientAction: null,
					}),
				};
				const resp = await fetchWrapper(url, options);
				pollResponse = await resp.json();
				assert.strictEqual(resp.status, 200);
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}
		});

		it('it should return the star printer poll response', async () => {
			assert.deepStrictEqual(pollResponse, FAKE_STAR_DATA);
		});

		it('it returns 200 status for no job found', async () => {
			const url = `${HOST}${STAR_ENDPOINT}`;

			try {
				const options = {
					method: 'POST',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({
						status: '23 6 4 0 0 0 0 0 0 ',
						printerMAC: 'FAKE:MAC:ADDRESS',
						statusCode: '200%20OK',
						printingInProgress: false,
						clientAction: null,
					}),
				};
				const resp = await fetchWrapper(url, options);
				assert.strictEqual(resp.status, 200);
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}
		});
	});

	describe('Printer deletes completed print job', () => {
		it('it should execute a successful HTTP request', async () => {
			const query = `code=200OK&mac=${FAKE_STAR_MAC}&token=${FAKE_STAR_JOB_TOKEN}`;
			const url = `${HOST}${STAR_ENDPOINT}?${query}`;

			try {
				const options = { method: 'DELETE' };
				const resp = await fetchWrapper(url, options);
				assert.strictEqual(resp.status, 200);
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}
		});
	});
});

describe('Epson printer flow', () => {
	describe('Add new print job', () => {
		it('it should execute a successful HTTP request', async () => {
			const url = `${HOST}${PRINTERS_ENDPOINT}`;

			try {
				const options = {
					method: 'PUT',
					headers: {
						'Content-type': 'application/xml',
						'uniquePrinterId': FAKE_EPSON_ID,
					},
					body: `
            <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <PrintRequestInfo Version="2.00">
                <ePOSPrint>
                    <Parameter>
                        <printjobid>${FAKE_EPSON_JOB_TOKEN}</printjobid>
                    </Parameter>
                    <PrintData> <!--object includes supplimental job information for when cash drawer needs to be open-->
                        <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
                            <pulse drawer="drawer_1" time="pulse_100" />
                        </epos-print>
                    </PrintData>
                </ePOSPrint>
            </PrintRequestInfo>
          `,
				};
				const resp = await fetchWrapper(url, options);
				assert.strictEqual(resp.status, 204);
			} catch (e) {
				assert.ok(false);
			}
		});

		it('it should have inserted a new job', async () => {
			const job = await getPrintJobById(FAKE_EPSON_ID, FAKE_EPSON_JOB_TOKEN);
			assert.equal(job.jobToken, FAKE_EPSON_JOB_TOKEN);
			assert.equal(job.uniquePrinterId, FAKE_EPSON_ID);
			assert.equal(job.status, 'ready');
			assert.equal(job.printerType, 'epson');
			assert.equal(typeof job.jobData, 'string');
		});
	});

	describe('Printer retrieves print job data', () => {
		let printJobData;

		it('it should execute a successful HTTP request', async () => {
			const url = `${HOST}${EPSON_ENDPOINT}`;

			try {
				const options = {
					method: 'POST',
					headers: {
						'Content-type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({ ConnectionType: 'GetRequest', ID: '', Name: FAKE_EPSON_ID }),
				};
				const resp = await fetchWrapper(url, options);
				printJobData = await resp.text();
				assert.strictEqual(resp.status, 200);
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}
		});

		it('it should return the star printer poll response', async () => {
			assert.equal(typeof printJobData, 'string');
		});
	});

	describe('Printer deletes completed print job', () => {
		it('it should execute a successful HTTP request', async () => {
			const body = new URLSearchParams({
				ConnectionType: 'SetResponse',
				ID: '',
				Name: FAKE_EPSON_ID,
				ResponseFile: `
					<?xml version="1.0" encoding="UTF-8"?>
					<PrintResponseInfo Version="2.00">
						<ePOSPrint>
						<Parameter>
							<devid>local_printer</devid>
							<printjobid>${FAKE_EPSON_JOB_TOKEN}</printjobid>
						</Parameter>
						<PrintResponse>
							<response xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print" success="true" code="" status="251658262"  battery="0"/> <!--job response for determining success or failure-->
						</PrintResponse>
						</ePOSPrint>
						<ePOSPrint>
						<Parameter>
							<devid>local_printer</devid>
						</Parameter>
						<PrintResponse>
							<response xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print" success="true" code="" status="251658258" battery="0"/>
						</PrintResponse>
						</ePOSPrint>
					</PrintResponseInfo>
				`,
			});

			const url = `${HOST}${EPSON_ENDPOINT}`;

			try {
				const options = {
					method: 'POST',
					headers: {
						'Content-type': 'application/x-www-form-urlencoded',
					},
					body,
				};
				const resp = await fetchWrapper(url, options);
				assert.strictEqual(resp.status, 200);
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}
		});
	});
});
