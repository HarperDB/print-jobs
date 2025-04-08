export interface IStarPutRequest {
	jobReady: boolean;
	mediaTypes: string[];
	jobToken: string;
}

export interface IStarPostRequest {
	status: string;
	printerMAC: string;
	statusCode: string;
	printingInProgress: boolean;
	clientAction: any;
}
