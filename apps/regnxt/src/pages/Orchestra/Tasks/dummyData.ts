export const dummySourceFields = [
  {name: 'instrument_id', type: 'string', label: 'Instrument ID'},
  {name: 'instrument_type', type: 'string', label: 'Instrument Type'},
  {name: 'price', type: 'number', label: 'Price'},
  {name: 'quantity', type: 'number', label: 'Quantity'},
  {name: 'trade_date', type: 'date', label: 'Trade Date'},
  {name: 'settlement_date', type: 'date', label: 'Settlement Date'},
];

export const dummyDestinationFields = [
  {name: 'id', type: 'string', label: 'ID'},
  {name: 'type', type: 'string', label: 'Type'},
  {name: 'amount', type: 'number', label: 'Amount'},
  {name: 'trade_date', type: 'date', label: 'Trade Date'},
];

export const dummyDatasets = [
  {id: 'dataset1', name: 'Trading Data', type: 'dataset'},
  {id: 'dataset2', name: 'Settlement Data', type: 'dataset'},
  {id: 'dataset3', name: 'Financial Instruments', type: 'dataset'},
];

export const dummyDataviews = [
  {id: 'dataview1', name: 'Active Trades View', type: 'dataview'},
  {id: 'dataview2', name: 'Settlement View', type: 'dataview'},
];

export const defaultRuntimeParameters = [
  {
    id: 'param1',
    name: 'source_id',
    type: 'string',
    defaultValue: '',
    description: 'Source dataset or dataview ID',
  },
  {
    id: 'param2',
    name: 'destination_id',
    type: 'string',
    defaultValue: '',
    description: 'Destination dataset ID',
  },
];
