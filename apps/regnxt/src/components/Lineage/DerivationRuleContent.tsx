import React from 'react';

import {DerivationDetails} from '@/types/databaseTypes';

import {Card, CardContent} from '@rn/ui/components/ui/card';

interface DerivationRuleContentProps {
  details: DerivationDetails;
}

export const DerivationRuleContent: React.FC<DerivationRuleContentProps> = ({details}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">
              Calculation of field
              <span> {details.base_details.destination_column}</span> (
              {details.column_mappings[0]?.destination_column_label})
            </h4>
            <p className="text-xs">
              {details.column_mappings[0]?.source_dataset} {'->'}{' '}
              {details.column_mappings[0]?.destination_dataset}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Source</h4>
          <pre className="p-4 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap">
            {details.base_details.dataview_statement}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Calculation</h4>
          <pre className="p-4 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap">
            {details.base_details.transformation_statement}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
