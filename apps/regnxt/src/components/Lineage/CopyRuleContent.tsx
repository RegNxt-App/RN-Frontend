import React, {useMemo} from 'react';

import {CopyDetails} from '@/types/databaseTypes';

import {Badge} from '@rn/ui/components/ui/badge';
import {Card, CardContent} from '@rn/ui/components/ui/card';

interface CopyRuleContentProps {
  details: CopyDetails;
}

export const CopyRuleContent: React.FC<CopyRuleContentProps> = ({details}) => {
  const {base_details, column_mappings, highlight_source_dataset} = details;

  const mappings = useMemo(() => {
    return column_mappings.map((mapping) => ({
      source: mapping.source_column,
      destination: mapping.destination_column,
      description: mapping.destination_column_label,
    }));
  }, [column_mappings]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2 items-center mb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-sm font-mono"
              >
                {base_details.source_dataset}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge
                variant="outline"
                className="text-sm font-mono"
              >
                {base_details.destination_dataset}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Column Mappings</h4>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium text-sm">Source Column</th>
                  <th className="text-left p-2 font-medium text-sm">Destination Column</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
                  >
                    <td className="p-2">
                      <code className="text-xs font-mono">{mapping.source}</code>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono">{mapping.destination}</code>
                        <span
                          className="text-xs text-muted-foreground cursor-help"
                          title={mapping.description}
                        >
                          ℹ️
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mappings.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">No column mappings available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
