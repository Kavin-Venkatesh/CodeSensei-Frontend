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
