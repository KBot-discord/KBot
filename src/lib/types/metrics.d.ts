export interface CommandMetricLabels extends Record<string, string | number> {
	name: string;
	category: string;
	result: 'success' | 'fail';
}
