import * as React from 'react';
import {
  CellTemplate,
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
  isNavigationKey,
  inNumericKey,
  isAllowedOnNumberTypingKey,
  isNumpadNumericKey,
  keyCodes,
} from '@silevis/reactgrid';

export interface InvalidNumberCell extends Cell {
  type: 'number';
  value: number;
  format?: Intl.NumberFormat;
  validator?: (value: number) => boolean;
  nanToZero?: boolean;
  hideZero?: boolean;
  errorMessage?: string;
}

export class InvalidNumberCellTemplate
  implements CellTemplate<InvalidNumberCell>
{
  private wasEscKeyPressed = false;

  getCompatibleCell(
    uncertainCell: Uncertain<InvalidNumberCell>,
  ): Compatible<InvalidNumberCell> {
    let value: number;
    try {
      value = getCellProperty(uncertainCell, 'value', 'number');
    } catch (error) {
      value = NaN;
    }
    const numberFormat =
      uncertainCell.format || new Intl.NumberFormat(window.navigator.language);
    const displayValue =
      uncertainCell.nanToZero && Number.isNaN(value) ? 0 : value;
    const text =
      Number.isNaN(displayValue) ||
      (uncertainCell.hideZero && displayValue === 0)
        ? ''
        : numberFormat.format(displayValue);
    return { ...uncertainCell, value: displayValue, text };
  }

  private isCharAllowedOnNumberInput = (char: string): boolean => {
    return char.match(/[\d.,+-]/) !== null;
  };

  private getTextFromCharCode = (cellText: string): string => {
    switch (cellText.charCodeAt(0)) {
      case keyCodes.DASH:
      case keyCodes.FIREFOX_DASH:
      case keyCodes.SUBTRACT:
        return '-';
      case keyCodes.COMMA:
        return ',';
      case keyCodes.PERIOD:
      case keyCodes.DECIMAL:
        return '.';
      default:
        return cellText;
    }
  };

  getClassName(
    cell: Compatible<InvalidNumberCell>,
    isInEditMode: boolean,
  ): string {
    const isValid = cell.validator?.(cell.value) ?? true;
    const baseClasses = 'text-right'; // Numbers are right-aligned
    return `${!isValid ? 'bg-red-100' : 'bg-white'} ${baseClasses} p-2`;
  }

  update(
    cell: Compatible<InvalidNumberCell>,
    cellToMerge: UncertainCompatible<InvalidNumberCell>,
  ): Compatible<InvalidNumberCell> {
    return this.getCompatibleCell({ ...cell, value: cellToMerge.value });
  }

  render(
    cell: Compatible<InvalidNumberCell>,
    isInEditMode: boolean,
    onCellChanged: (
      cell: Compatible<InvalidNumberCell>,
      commit: boolean,
    ) => void,
  ): React.ReactNode {
    if (!isInEditMode) {
      const isValid = cell.validator?.(cell.value) ?? true;
      const textToDisplay =
        !isValid && cell.errorMessage ? cell.errorMessage : cell.text;
      return (
        <div className={this.getClassName(cell, isInEditMode)}>
          {textToDisplay}
        </div>
      );
    }

    const locale = cell.format
      ? cell.format.resolvedOptions().locale
      : window.navigator.languages[0];
    const format = new Intl.NumberFormat(locale, {
      useGrouping: false,
      maximumFractionDigits: 20,
    });

    return (
      <input
        inputMode="decimal"
        className="w-full h-full px-2 text-right focus:outline-none"
        ref={(input) => {
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }}
        defaultValue={
          Number.isNaN(cell.value)
            ? this.getTextFromCharCode(cell.text)
            : format.format(cell.value)
        }
        onChange={(e) =>
          onCellChanged(
            this.getCompatibleCell({
              ...cell,
              value: parseFloat(e.currentTarget.value.replace(/,/g, '.')),
            }),
            false,
          )
        }
        onBlur={(e) => {
          onCellChanged(
            this.getCompatibleCell({
              ...cell,
              value: parseFloat(e.currentTarget.value.replace(/,/g, '.')),
            }),
            !this.wasEscKeyPressed,
          );
          this.wasEscKeyPressed = false;
        }}
        onKeyDown={(e) => {
          if (
            inNumericKey(e.keyCode) ||
            isNavigationKey(e.keyCode) ||
            isAllowedOnNumberTypingKey(e.keyCode) ||
            ((e.ctrlKey || e.metaKey) && e.keyCode === keyCodes.KEY_A)
          ) {
            e.stopPropagation();
          }
          if (
            !inNumericKey(e.keyCode) &&
            !isNavigationKey(e.keyCode) &&
            !this.isCharAllowedOnNumberInput(e.key)
          ) {
            e.preventDefault();
          }
          if (e.keyCode === keyCodes.ESCAPE) {
            this.wasEscKeyPressed = true;
          }
        }}
      />
    );
  }
}
