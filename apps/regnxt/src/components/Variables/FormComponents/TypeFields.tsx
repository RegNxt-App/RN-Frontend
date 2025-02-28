import React from 'react';
import {Control} from 'react-hook-form';

import {VariableFormData} from '@/hooks/useVariableForm';

import BooleanFields from './BooleanFields';
import EnumFields from './EnumFields';
import NumberFields from './NumberFields';
import StringFields from './StringFields';

interface TypeFieldsProps {
  type: string;
  control: Control<VariableFormData>;
}

const TypeFields: React.FC<TypeFieldsProps> = ({type, control}) => {
  switch (type) {
    case 'string':
      return <StringFields control={control} />;
    case 'number':
    case 'integer':
      return <NumberFields control={control} />;
    case 'boolean':
      return <BooleanFields control={control} />;
    case 'enum':
      return <EnumFields control={control} />;
    case 'date':
      return null;
    default:
      return null;
  }
};

export default TypeFields;
