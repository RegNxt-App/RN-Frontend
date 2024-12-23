import * as React from 'react';

import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';

export interface EmptyCell extends Cell {
  type: 'empty';
  text: string;
}

export class EmptyCellTemplate implements CellTemplate<EmptyCell> {
  getCompatibleCell(uncertainCell: Uncertain<EmptyCell>): Compatible<EmptyCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return {...uncertainCell, text, value};
  }

  update(cell: Compatible<EmptyCell>, cellToMerge: UncertainCompatible<EmptyCell>): Compatible<EmptyCell> {
    return this.getCompatibleCell({...cell, text: cellToMerge.text});
  }

  render(cell: Compatible<EmptyCell>, isInEditMode: boolean): React.ReactNode {
    return (
      <div
        className="bg-white p-2 cursor-not-allowed"
        dangerouslySetInnerHTML={{__html: cell.text}}
      />
    );
  }
}
