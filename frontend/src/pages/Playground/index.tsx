import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  IconButton, 
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import { PlayArrow, Refresh, ContentCopy, Check } from '@mui/icons-material';

interface CodeSnippet {
  id: string;
  name: string;
  language: string;
  code: string;
}

const Playground = () => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, Playground!");');
  const [output, setOutput] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [savedSnippets, setSavedSnippets] = useState<CodeSnippet[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedSnippet, setSelectedSnippet] = useState<string>('');

  // Available programming languages
  const languages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'ruby',
    'php',
    'swift',
    'kotlin'
  ];

  // Sample snippets
  const sampleSnippets: CodeSnippet[] = [
    {
      id: '1',
      name: 'Fibonacci Sequence',
      language: 'javascript',
      code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Calculate first 10 Fibonacci numbers\nfor (let i = 0; i < 10; i++) {\n  console.log(`Fibonacci(${i}) = ${fibonacci(i)}`);\n}'
    },
    {
      id: '2',
      name: 'Quick Sort',
      language: 'python',
      code: 'def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\n# Example usage\narr = [3, 6, 8, 10, 1, 2, 1]\nprint(f"Original array: {arr}")\nprint(f"Sorted array: {quick_sort(arr)}")'
    }
  ];

  // Load sample snippets on first render
  useEffect(() => {
    setSavedSnippets(sampleSnippets);
  }, []);

  const handleRunCode = () => {
    try {
      // Save the current console.log
      const originalConsoleLog = console.log;
      let outputText = '';
      
      // Override console.log to capture output
      console.log = (...args) => {
        const formattedArgs = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        outputText += formattedArgs + '\n';
        originalConsoleLog(...args);
      };

      // Execute the code
      if (language === 'javascript' || language === 'typescript') {
        // Use Function constructor to execute code in a controlled way
        try {
          const result = new Function(code)();
          if (result !== undefined) {
            outputText += String(result) + '\n';
          }
        } catch (e) {
          const error = e instanceof Error ? e : new Error('Unknown error occurred');
          outputText = `Error: ${error.message}`;
        }
      } else {
        // For other languages, just show a message in this demo
        outputText = `Code execution for ${language} is not supported in this demo.`;
      }

      setOutput(outputText);
      
      // Restore original console.log
      console.log = originalConsoleLog;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      setOutput(`Error: ${err.message}`);
    }
  };

  const handleReset = () => {
    setCode('// Write your code here\nconsole.log("Hello, Playground!");');
    setOutput('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleSnippetChange = (event: SelectChangeEvent) => {
    const snippetId = event.target.value;
    setSelectedSnippet(snippetId);
    const snippet = savedSnippets.find(s => s.id === snippetId);
    if (snippet) {
      setCode(snippet.code);
      setLanguage(snippet.language);
    }
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Interactive Code Playground
      </Typography>
      
      <Grid container spacing={2} sx={{ flexGrow: 1, mb: 2 }}>
        {/* Code Editor */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1,
            flexWrap: 'wrap',
            gap: 1
          }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={handleLanguageChange}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Load Snippet</InputLabel>
              <Select
                value={selectedSnippet}
                label="Load Snippet"
                onChange={handleSnippetChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select a snippet</em>
                </MenuItem>
                {savedSnippets.map((snippet) => (
                  <MenuItem key={snippet.id} value={snippet.id}>
                    {snippet.name} ({snippet.language})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Tooltip title="Copy Code">
              <IconButton onClick={handleCopyCode} color="primary">
                {copied ? <Check /> : <ContentCopy />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Reset">
              <IconButton onClick={handleReset} color="secondary">
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={handleRunCode}
              sx={{ ml: 1 }}
            >
              Run
            </Button>
          </Box>
          
          <Paper elevation={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Box
              component="textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                lineHeight: '1.5',
              }}
              spellCheck="false"
            />
          </Paper>
        </Grid>
        
        {/* Output */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Output
          </Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              flexGrow: 1, 
              p: 2, 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              minHeight: '200px',
              height: '100%',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#2d2d2d',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#3e3e3e',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#4f4f4f',
              },
            }}
          >
            {output || 'Output will appear here...'}
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Documentation Section */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Documentation
        </Typography>
        <Typography paragraph>
          This is an interactive code playground where you can write and execute code in various programming languages.
          Currently, only JavaScript execution is supported in this demo. Other languages will show a placeholder message.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Features:
        </Typography>
        <ul>
          <li>Write and execute code in multiple programming languages</li>
          <li>Save and load code snippets</li>
          <li>View console output in real-time</li>
          <li>Responsive layout that works on different screen sizes</li>
        </ul>
      </Box>
    </Box>
  );
};

export default Playground;
