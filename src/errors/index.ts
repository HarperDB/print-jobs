export class StarJobNotFound extends Error {
	statusCode: number;
	path: string;
	timestamp: number;

	constructor() {
		super('Not Found');
		this.statusCode = 404;
		this.name = 'Not Found';
		this.timestamp = Date.now();
		this.path = '/restservices/cwpos/v1/cloudPrintServices/printers';
	}
}
