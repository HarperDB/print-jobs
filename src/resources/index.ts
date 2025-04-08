import { Printers } from './printers.js';
import { Epson } from './epson.js';
import { Star } from './star.js';

export const restservices = {
	cwpos: {
		v1: {
			cloudPrinterServices: {
				printers: Star,
				service: {
					'printers': Printers,
					'printers/epson': Epson,
				},
			},
		},
	},
};
