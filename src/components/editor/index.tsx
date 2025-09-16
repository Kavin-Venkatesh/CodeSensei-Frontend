import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';
import styles from './editor.module.css';


interface EditorProps {
    value?: string;
    language?: string | undefined;
    onChange?: (value: string | undefined , event : monaco.editor.IModelContentChangedEvent) => void;
    readOnly? : boolean;
    theme? : string;
}

export const languageIdToMonacoLanguage: Record<number, string> = {
  109: 'python',       // Python (3.8.1)
  63: 'javascript',   // JavaScript (Node.js 12.14.0)
  91: 'java',         // Java (OpenJDK 13.0.1)
  54: 'cpp',          // C++ (GCC 9.2.0)
  50: 'c',            // C (GCC 9.2.0)
  51: 'csharp',       // C# (Mono 6.6.0.161)
  68: 'php',          // PHP (7.4.1)
  72: 'ruby',         // Ruby (2.7.0)
  60: 'go',           // Go (1.13.5)
  74: 'typescript',   // TypeScript (3.7.4)
};


loader.config({ monaco });

const OurEditor = ({value = "",language , onChange , readOnly = false, theme = "vs-dark"} : EditorProps) =>{

    return(
        <Editor 
            value = {value}
            onChange = {onChange}
            defaultLanguage="python"
            language = {language === "Javascript" ? '' : language}
            theme = {theme}
            options = {{
                quickSuggestions: true,
                parameterHints: { enabled: true },
                suggestOnTriggerCharacters: false,
                tabCompletion: "on",
                autoClosingBrackets: "languageDefined",
                readOnly: readOnly,
                minimap: { enabled: false },
                fontSize: 16,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                theme: theme
            }}

            className={styles.editor}

        />
    )
}

export default OurEditor;
