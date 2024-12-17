import React, {ForwardedRef} from 'react';

// adopted from react aria components
// https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/utils.tsx#LL19C1

declare function forwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
): (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export type forwardRefType = typeof forwardRef;
export const slotCallbackSymbol = Symbol('callback');

interface SlottedValue<T> {
  slots?: Record<string | symbol, T>;
  [slotCallbackSymbol]?: (value: T) => void;
}

export type WithRef<T, E> = T & {ref?: ForwardedRef<E>};

export interface SlotProps {
  /** A slot name for the component. Slots allow the component to receive props from a parent component. */
  slot?: string;
}

export type ContextValue<T extends SlotProps, E extends Element> =
  | SlottedValue<WithRef<T, E>>
  | WithRef<T, E>
  | null
  | undefined;
