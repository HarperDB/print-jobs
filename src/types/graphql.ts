export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	Any: { input: { [key: string]: any }; output: { [key: string]: any } };
};

export type PrintJob = {
	__typename?: 'PrintJob';
	createdAt?: Maybe<Scalars['Float']['output']>;
	fetchedAt?: Maybe<Scalars['Float']['output']>;
	jobData?: Maybe<Scalars['String']['output']>;
	jobToken: Scalars['String']['output'];
	printerType: PrinterType;
	starPollResponse?: Maybe<Scalars['Any']['output']>;
	status: PrintJobStatus;
	uniquePrinterId: Scalars['String']['output'];
	uniquePrinterIdJobToken: Scalars['String']['output'];
};

export enum PrintJobStatus {
	Fetched = 'fetched',
	Ready = 'ready',
}

export enum PrinterType {
	Epson = 'epson',
	Star = 'star',
}
