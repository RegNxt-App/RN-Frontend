import React from 'react';

export const getTableAlias = (text: string, datasetName: string) => {
  if (!text || !datasetName) return null;
  const regex = new RegExp(`${datasetName}\\s+(t\\d+)`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
};
export const highlightDatasetName = (text: string, datasetName: string) => {
  if (!text || !datasetName) return text;
  const parts = text.split(datasetName);
  if (parts.length <= 1) return text;

  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <span className="bg-yellow-200 font-medium">{datasetName}</span>}
      {part}
    </React.Fragment>
  ));
};

export const highlightAliasReferences = (
  element: string | React.ReactNode,
  tableAlias: string,
  elementIndex: number
) => {
  if (typeof element !== 'string') return element;

  const aliasPattern = new RegExp(`${tableAlias}\\.[A-Z0-9_]+`, 'g');
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let matchIndex = 0;

  aliasPattern.lastIndex = 0;

  while ((match = aliasPattern.exec(element)) !== null) {
    if (match.index > lastIndex) {
      result.push(element.substring(lastIndex, match.index));
    }

    result.push(
      <span
        key={`${elementIndex}-${matchIndex++}`}
        className="bg-yellow-200 font-medium"
      >
        {match[0]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < element.length) {
    result.push(element.substring(lastIndex));
  }

  return result.length ? result : element;
};
