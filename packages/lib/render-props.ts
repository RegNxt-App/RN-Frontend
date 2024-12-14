import type {CSSProperties, ReactNode} from 'react';

import {filterDOMProps} from '@react-aria/utils';
import type {AriaLabelingProps, DOMProps as SharedDOMProps} from '@react-types/shared/src/dom';

export interface StyleRenderProps<T> {
  /** The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. */
  className?: string | ((values: T) => string);
  /** The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. */
  style?: CSSProperties | ((values: T) => CSSProperties);
}

export interface RenderProps<T> extends StyleRenderProps<T> {
  /** The children of the component. A function may be provided to alter the children based on component state. */
  children?: ReactNode | ((values: T) => ReactNode);
}

interface RenderPropsHookOptions<T> extends RenderProps<T>, SharedDOMProps, AriaLabelingProps {
  values: T;
  defaultChildren?: ReactNode;
  defaultClassName?: string;
}

export function useRenderProps<T>({
  className,
  style,
  children,
  defaultClassName,
  defaultChildren,
  values,
  ...otherProps
}: RenderPropsHookOptions<T>) {
  if (typeof className === 'function') {
    className = className(values);
  }

  if (typeof style === 'function') {
    style = style(values);
  }

  if (typeof children === 'function') {
    children = children(values);
  } else if (children == null) {
    children = defaultChildren;
  }

  delete otherProps.id;
  return {
    ...filterDOMProps(otherProps),
    className: className ?? defaultClassName,
    style,
    children,
  };
}
