export const extractPrintJobId = (pattern: string): string | null => {
	const regex = /<printjobid>(\d+)<\/printjobid>/;
	const match = regex.exec(pattern);
	return match ? match[1] : null;
};

export const extractUniquePrinterId = (pattern: string): string | null => {
	const regex = /name="Name"\s+(\w+)\s+----------------------------/;
	const match = regex.exec(pattern);
	return match ? match[1] : null;
};
