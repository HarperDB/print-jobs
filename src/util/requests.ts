import 'dotenv/config';
import { EPSON_JOB_ENDPOINT, STAR_JOB_ENDPOINT } from '../constants/index.js';
import type { IEpsonDeleteRequest } from '../types/epson.js';

export const passThroughStarDelete = async (params: URLSearchParams): Promise<void> => {
	await fetch(`${process.env.PASS_THROUGH_HOST}${STAR_JOB_ENDPOINT}?${params.toString()}`, { method: 'DELETE' });
};

export const passThroughEpsonDelete = async (data: IEpsonDeleteRequest): Promise<void> => {
	const formData = new URLSearchParams(data as any);

	await fetch(`${process.env.PASS_THROUGH_HOST}${EPSON_JOB_ENDPOINT}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formData.toString(),
	});
};
