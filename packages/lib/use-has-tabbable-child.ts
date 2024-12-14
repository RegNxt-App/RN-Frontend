// todo: replace it with import from @react-aria/focus when this utit is published

import {getFocusableTreeWalker} from '@react-aria/focus';
import {RefObject, useState} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

interface AriaHasTabbableChildOptions {
  isDisabled?: boolean
}

// This was created for a special empty case of a component that can have child or
// be empty, like Collection/Virtualizer/Table/ListView/etc. When these components
// are empty they can have a message with a tabbable element, which is like them
// being not empty, when it comes to focus and tab order.

/**
 * Returns whether an element has a tabbable child, and updates as children change.
 * @private
 */
export function useHasTabbableChild(ref: RefObject<Element>, options?: AriaHasTabbableChildOptions): boolean {
  const isDisabled = options?.isDisabled;
  const [hasTabbableChild, setHasTabbableChild] = useState(false);

  useLayoutEffect(() => {
    if (ref?.current && !isDisabled) {
      const update = () => {
        if (ref.current) {
          const walker = getFocusableTreeWalker(ref.current, {tabbable: true});
          setHasTabbableChild(!!walker.nextNode());
        }
      };

      update();

      // Update when new elements are inserted, or the tabIndex/disabled attribute updates.
      const observer = new MutationObserver(update);
      observer.observe(ref.current, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['tabIndex', 'disabled']
      });

      return () => {
        // Disconnect mutation observer when a React update occurs on the top-level component
        // so we update synchronously after re-rendering. Otherwise React will emit act warnings
        // in tests since mutation observers fire asynchronously. The mutation observer is necessary
        // so we also update if a child component re-renders and adds/removes something tabbable.
        observer.disconnect();
      };
    }
  });

  return isDisabled ? false : hasTabbableChild;
}
