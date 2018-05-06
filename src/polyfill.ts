import values from 'object.values';
import entries from 'object.entries';

if (!Object.values) values.shim();
if (!Object.entries) entries.shim();
