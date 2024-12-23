import * as React from 'react';

import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';

export interface ShadedCell extends Cell {
  type: 'shaded';
  text: string;
}

export class ShadedCellTemplate implements CellTemplate<ShadedCell> {
  getCompatibleCell(uncertainCell: Uncertain<ShadedCell>): Compatible<ShadedCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return {...uncertainCell, text, value};
  }

  update(cell: Compatible<ShadedCell>, cellToMerge: UncertainCompatible<ShadedCell>): Compatible<ShadedCell> {
    return this.getCompatibleCell({...cell, text: cellToMerge.text});
  }

  render(cell: Compatible<ShadedCell>, isInEditMode: boolean): React.ReactNode {
    return (
      <div
        className="bg-gray-100 p-2 cursor-not-allowed"
        dangerouslySetInnerHTML={{__html: cell.text}}
      />
    );
  }
}
