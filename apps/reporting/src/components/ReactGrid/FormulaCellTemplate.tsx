import * as React from 'react';
import {
  CellTemplate,
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';

export interface FormulaCell extends Cell {
  type: 'formula';
  text: string;
}

export class FormulaCellTemplate implements CellTemplate<FormulaCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<FormulaCell>,
  ): Compatible<FormulaCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }

  update(
    cell: Compatible<FormulaCell>,
    cellToMerge: UncertainCompatible<FormulaCell>,
  ): Compatible<FormulaCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }

  render(
    cell: Compatible<FormulaCell>,
    isInEditMode: boolean,
  ): React.ReactNode {
    return (
      <div
        className="text-blue-600 p-2 cursor-not-allowed"
        dangerouslySetInnerHTML={{ __html: cell.text }}
      />
    );
  }
}
