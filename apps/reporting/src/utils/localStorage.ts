export const removeLastSelectedSheetItems = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('lastSelectedSheet-'))
    .forEach((key) => localStorage.removeItem(key));
};
