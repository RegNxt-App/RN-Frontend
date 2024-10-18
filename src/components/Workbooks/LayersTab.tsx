import LayersTable from '../Tables/workbooks/layers/LayersData';

const layersData: LayersTableData[] = [
  {
    versionId: 123,
    from: '123',
    to: '123',
    reason: 'Test',
    modifier: 'Test',
  },
];
interface LayersTableData {
  versionId: number;
  from: string;
  to: string;
  reason: string;
  modifier: string;
}

const LayersTab: React.FC = () => {
  return <LayersTable data={layersData} />;
};

export default LayersTab;
