import * as React from 'react';

import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
  isAlphaNumericKey,
  isNavigationKey,
  keyCodes,
} from '@silevis/reactgrid';

export interface InvalidTextCell extends Cell {
  type: 'text';
  text: string;
  placeholder?: string;
  validator?: (text: string) => boolean;
  errorMessage?: string;
}

export class InvalidTextCellTemplate implements CellTemplate<InvalidTextCell> {
  private wasEscKeyPressed = false;

  getCompatibleCell(uncertainCell: Uncertain<InvalidTextCell>): Compatible<InvalidTextCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    let placeholder: string | undefined;
    try {
      placeholder = getCellProperty(uncertainCell, 'placeholder', 'string');
    } catch {
      placeholder = '';
    }
    const value = parseFloat(text);
    return {...uncertainCell, text, value, placeholder};
  }

  update(
    cell: Compatible<InvalidTextCell>,
    cellToMerge: UncertainCompatible<InvalidTextCell>
  ): Compatible<InvalidTextCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      placeholder: cellToMerge.placeholder,
    });
  }

  getClassName(cell: Compatible<InvalidTextCell>, isInEditMode: boolean): string {
    const isValid = cell.validator ? cell.validator(cell.text) : true;
    const baseClasses = cell.placeholder && cell.text === '' ? 'text-gray-400' : '';
    return `${isValid ? '' : 'bg-red-100'} ${baseClasses}`;
  }

  render(
    cell: Compatible<InvalidTextCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<InvalidTextCell>, commit: boolean) => void
  ): React.ReactNode {
    if (!isInEditMode) {
      const isValid = cell.validator ? cell.validator(cell.text) : true;
      const cellText = cell.text || cell.placeholder || '';
      const textToDisplay = !isValid && cell.errorMessage ? cell.errorMessage : cellText;
      return <div className={this.getClassName(cell, isInEditMode)}>{textToDisplay}</div>;
    }

    return (
      <input
        className="w-full h-full px-2 focus:outline-none"
        ref={(input) => {
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }}
        defaultValue={cell.text}
        onChange={(e) => onCellChanged(this.getCompatibleCell({...cell, text: e.currentTarget.value}), false)}
        onBlur={(e) => {
          onCellChanged(
            this.getCompatibleCell({...cell, text: e.currentTarget.value}),
            !this.wasEscKeyPressed
          );
          this.wasEscKeyPressed = false;
        }}
        placeholder={cell.placeholder}
        onKeyDown={(e) => {
          if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode)) {
            e.stopPropagation();
          }
          if (e.keyCode === keyCodes.ESCAPE) {
            this.wasEscKeyPressed = true;
          }
        }}
      />
    );
  }
}
