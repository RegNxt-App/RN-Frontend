import * as React from 'react';

import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';

export interface HeaderCell extends Cell {
  type: 'header';
  text: string;
  colspan?: number;
  rowspan?: number;
}

export class HeaderCellTemplate implements CellTemplate<HeaderCell> {
  getCompatibleCell(uncertainCell: Uncertain<HeaderCell>): Compatible<HeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    const colspan = uncertainCell.colspan || 1;
    const rowspan = uncertainCell.rowspan || 1;
    return {...uncertainCell, text, value, colspan, rowspan};
  }

  update(cell: Compatible<HeaderCell>, cellToMerge: UncertainCompatible<HeaderCell>): Compatible<HeaderCell> {
    return this.getCompatibleCell({...cell, text: cellToMerge.text});
  }

  render(cell: Compatible<HeaderCell>, isInEditMode: boolean): React.ReactNode {
    const height =
      cell.rowspan && cell.rowspan > 1 ? `calc(${cell.rowspan * 100}% + ${cell.rowspan - 1}px)` : '100%';

    const width =
      cell.colspan && cell.colspan > 1 ? `calc(${cell.colspan * 100}% + ${cell.colspan - 1}px)` : '100%';

    const hasRowSpan = cell.rowspan && cell.rowspan > 1;
    const hasColSpan = cell.colspan && cell.colspan > 1;

    // Different styling based on span type
    const getFlexStyles = () => {
      if (hasRowSpan && !hasColSpan) {
        // Only rowspan - align text to top
        return {
          flexDirection: 'column' as const,
          justifyContent: 'flex-start',
          alignItems: 'center',
        };
      } else if (hasColSpan) {
        // Has colspan - align text to left
        return {
          flexDirection: 'row' as const,
          justifyContent: 'flex-start', // Changed to flex-start for left alignment
          alignItems: 'center',
        };
      } else {
        // Regular cell - center align text
        return {
          flexDirection: 'row' as const,
          justifyContent: 'center',
          alignItems: 'center',
        };
      }
    };

    const flexStyles = getFlexStyles();

    return (
      <div
        className="select-none"
        style={{
          background: '#e5e7eb',
          border: '1px solid #1e88e5',
          height,
          width,
          boxSizing: 'border-box',
          cursor: 'default',
          position: 'absolute',
          top: 0,
          left: 0,
          borderCollapse: 'collapse',
          gridArea:
            hasRowSpan || hasColSpan ? `span ${cell.rowspan || 1} / span ${cell.colspan || 1}` : undefined,
          zIndex: hasRowSpan || hasColSpan ? 1 : 'auto',
          display: 'flex',
          ...flexStyles,
        }}
      >
        <div
          style={{
            padding: '4px 8px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: hasColSpan ? 'left' : 'center', // Text align left for colspan cells
            width: '100%',
            maxWidth: '100%',
            marginTop: hasRowSpan && !hasColSpan ? '4px' : '0',
            marginLeft: hasColSpan ? '8px' : '0', // Added margin for colspan cells
          }}
          dangerouslySetInnerHTML={{__html: cell.text}}
        />
      </div>
    );
  }
}
