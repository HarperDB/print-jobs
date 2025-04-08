export interface IEpsonPostRequest {
	ConnectionType: string;
	ID: string;
	Name: string;
	ResponseFile: string;
}

export interface IEpsonDeleteRequest extends IEpsonPostRequest {
	ResponseFile: string;
}
