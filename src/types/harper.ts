export type TJsonRequest = Record<string, any>;

export interface IBufferData {
	contentType: string;
	data: Buffer;
}

export type TResourceContext = Request & { data: Promise<IBufferData | TJsonRequest>; url: string };

export interface IGetRequest {
	url: string;
}
