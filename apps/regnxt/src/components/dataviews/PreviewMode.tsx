import {useEffect, useState} from 'react';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface PreviewModeProps {
  config: any; // You might want to define a more specific type for your config
}

export function PreviewMode({config}: PreviewModeProps) {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState('');

  useEffect(() => {
    // Here you would typically make an API call to your backend to get the preview data and SQL query
    // For this example, we'll use dummy data that matches the SQL query
    const dummyData = [
      {
        customer_id: 1001,
        customer_name: 'John Doe',
        total_transactions: 25,
        total_amount: 15000.5,
      },
      {
        customer_id: 1002,
        customer_name: 'Jane Smith',
        total_transactions: 42,
        total_amount: 8500.75,
      },
      {
        customer_id: 1003,
        customer_name: 'Bob Johnson',
        total_transactions: 18,
        total_amount: 22000.0,
      },
      {
        customer_id: 1004,
        customer_name: 'Alice Brown',
        total_transactions: 35,
        total_amount: 5200.25,
      },
      {
        customer_id: 1005,
        customer_name: 'Charlie Wilson',
        total_transactions: 10,
        total_amount: 30000.0,
      },
    ];
    setPreviewData(dummyData);

    const dummyQuery = `
SELECT 
  c.customer_id,
  CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
  COUNT(t.transaction_id) AS total_transactions,
  SUM(t.amount) AS total_amount
FROM 
  customers c
LEFT JOIN 
  transactions t ON c.customer_id = t.customer_id
WHERE 
  c.status = 'active'
GROUP BY 
  c.customer_id
HAVING 
  total_transactions > 5
ORDER BY 
  total_amount DESC
LIMIT 10;
`;
    setSqlQuery(dummyQuery);
  }, [config]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{sqlQuery}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <TableHead
                      key={key}
                      className="whitespace-nowrap"
                    >
                      {key
                        .split('_')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.entries(row).map(([key, value]: [string, any], cellIndex) => (
                      <TableCell key={cellIndex}>
                        {typeof value === 'number'
                          ? value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
