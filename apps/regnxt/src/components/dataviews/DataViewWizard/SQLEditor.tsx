import {useRef, useState} from 'react';

import {Card} from '@/components/ui/card';
import {toast} from '@/hooks/use-toast';
import Editor, {Monaco} from '@monaco-editor/react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  onValidQuery?: (query: string) => void;
}

export function SqlEditor({value, onChange, height = '300px', onValidQuery}: SqlEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const [isValid, setIsValid] = useState(true);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    monacoRef.current = monaco;

    // Register SQL language features
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'SELECT',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'SELECT',
          },
          {
            label: 'FROM',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'FROM',
          },
          {
            label: 'WHERE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'WHERE',
          },
          {
            label: 'INNER JOIN',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'INNER JOIN',
          },
          {
            label: 'LEFT JOIN',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'LEFT JOIN',
          },
          {
            label: 'RIGHT JOIN',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'RIGHT JOIN',
          },
          {
            label: 'FULL JOIN',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'FULL JOIN',
          },
          {
            label: 'ON',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'ON',
          },
          {
            label: 'AND',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'AND',
          },
          {
            label: 'OR',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'OR',
          },
        ];
        return {suggestions};
      },
    });

    monaco.languages.registerDocumentFormattingEditProvider('sql', {
      provideDocumentFormattingEdits: (model) => {
        const text = model.getValue();
        try {
          // Basic SQL validation
          validateSql(text);
          setIsValid(true);
          onValidQuery?.(text);
        } catch (error) {
          setIsValid(false);
          toast({
            title: 'SQL Syntax Error',
            description: error.message,
            variant: 'destructive',
          });
        }
        return [];
      },
    });
  };

  const validateSql = (sql: string) => {
    // Basic SQL validation
    const normalized = sql.trim().toUpperCase();

    if (!normalized.startsWith('SELECT')) {
      throw new Error('Query must start with SELECT');
    }

    if (!normalized.includes('FROM')) {
      throw new Error('Query must include FROM clause');
    }

    // Check for balanced parentheses
    let parentheses = 0;
    for (const char of sql) {
      if (char === '(') parentheses++;
      if (char === ')') parentheses--;
      if (parentheses < 0) {
        throw new Error('Unmatched parentheses');
      }
    }
    if (parentheses !== 0) {
      throw new Error('Unmatched parentheses');
    }

    // Check JOIN syntax
    const joins = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'];
    for (const join of joins) {
      if (normalized.includes(join) && !normalized.includes('ON')) {
        throw new Error(`${join} must be followed by ON clause`);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="sql"
        value={value}
        onChange={(value) => {
          onChange(value || '');
          if (value) {
            try {
              validateSql(value);
              setIsValid(true);
              onValidQuery?.(value);
            } catch (error) {
              setIsValid(false);
            }
          }
        }}
        options={{
          minimap: {enabled: false},
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
        onMount={handleEditorDidMount}
        theme="vs-dark"
      />
    </Card>
  );
}
