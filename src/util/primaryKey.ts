export const getPrimaryKey = (uniquePrinterId: string | null, jobToken: string | null): string =>
	`${uniquePrinterId}.${jobToken}`;
