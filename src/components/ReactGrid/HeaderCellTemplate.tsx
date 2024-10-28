import * as React from 'react';
import {
  CellTemplate,
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';

export interface HeaderCell extends Cell {
  type: 'header';
  text: string;
}

export class HeaderCellTemplate implements CellTemplate<HeaderCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<HeaderCell>,
  ): Compatible<HeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }

  update(
    cell: Compatible<HeaderCell>,
    cellToMerge: UncertainCompatible<HeaderCell>,
  ): Compatible<HeaderCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }

  render(cell: Compatible<HeaderCell>, isInEditMode: boolean): React.ReactNode {
    return (
      <div
        className="bg-gray-200 font-semibold p-2 cursor-not-allowed"
        dangerouslySetInnerHTML={{ __html: cell.text }}
      />
    );
  }
}
