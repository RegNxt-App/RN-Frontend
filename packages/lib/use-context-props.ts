import {Context, ForwardedRef, RefObject, useContext, useEffect, useMemo} from 'react';

import {mergeProps, mergeRefs, useObjectRef} from '@react-aria/utils';

import {ContextValue, SlotProps, WithRef, slotCallbackSymbol} from './types';

export const defaultSlot = Symbol('default');

export function useContextProps<T, U extends SlotProps, E extends Element>(
  props: T & SlotProps,
  ref: ForwardedRef<E>,
  context: Context<ContextValue<U, E>>
): [T, RefObject<E>] {
  const {...ctx} = useContext(context) || {};

  const rootCtx = ctx as WithRef<U, E>;
  let defaultCtx: WithRef<U, E> | undefined;
  let slottedCtx: WithRef<U, E> | undefined;

  if ('slots' in ctx && ctx.slots) {
    slottedCtx = ctx.slots[props.slot ?? ''] || {};

    // check for type/* slots
    if (!slottedCtx && 'type' in props && props.type) {
      slottedCtx = ctx.slots[`type/${props.type}`] || {};
    }

    defaultCtx = ctx.slots[defaultSlot] || {};
  }

  if ('slots' in rootCtx) {
    delete rootCtx.slots;
  }

  // @ts-ignore - TS says "Type 'unique symbol' cannot be used as an index type." but not sure why.
  const {ref: rootCtxRef, [slotCallbackSymbol]: rootCtxCallback, ...rootCtxProps} = rootCtx;
  // @ts-ignore - TS says "Type 'unique symbol' cannot be used as an index type." but not sure why.
  const {ref: defaultCtxRef, [slotCallbackSymbol]: defaultCtxCallback, ...defaultCtxProps} = defaultCtx || {};
  // @ts-ignore - TS says "Type 'unique symbol' cannot be used as an index type." but not sure why.
  const {ref: slottedCtxRef, [slotCallbackSymbol]: slottedCtxCallback, ...slottedCtxProps} = slottedCtx || {};

  const mergedRef = useObjectRef(
    useMemo(
      () => mergeRefs(ref, rootCtxRef!, defaultCtxRef!, slottedCtxRef!),
      [ref, rootCtxRef, defaultCtxRef, slottedCtxRef]
    )
  );
  const mergedProps = mergeProps(rootCtxProps, defaultCtxProps, slottedCtxProps, props) as unknown as T;

  // A parent component might need the props from a child, so call slot callback if needed.
  useEffect(() => {
    if (rootCtxCallback) {
      rootCtxCallback(props);
    }
    if (defaultCtxCallback) {
      defaultCtxCallback(props);
    }
    if (slottedCtxCallback) {
      slottedCtxCallback(props);
    }
  }, [rootCtxCallback, defaultCtxCallback, slottedCtxCallback, props]);

  return [mergedProps, mergedRef];
}
