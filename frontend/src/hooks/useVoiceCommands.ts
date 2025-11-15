import { useCallback } from 'react';

export type VoiceCommandType =
  | 'navigate'
  | 'autofill'
  | 'submit'
  | 'help'
  | 'exit'
  | 'save'
  | 'progress'
  | 'repeat'
  | 'field_update'
  | 'unknown';

export interface VoiceCommand {
  type: VoiceCommandType;
  params?: {
    direction?: 'next' | 'previous';
    scope?: 'section' | 'form';
    topic?: string;
    sectionName?: string;
    fieldName?: string;
    fieldValue?: string;
  };
  originalText: string;
}

export interface VoiceCommandHandlers {
  onNavigate?: (direction: 'next' | 'previous', sectionName?: string) => void;
  onAutoFill?: (scope: 'section' | 'form') => void;
  onSubmit?: () => void;
  onHelp?: (topic?: string) => void;
  onExit?: () => void;
  onSave?: () => void;
  onShowProgress?: () => void;
  onRepeat?: () => void;
  onFieldUpdate?: (fieldName: string, fieldValue: string) => void;
}

export const useVoiceCommands = (handlers: VoiceCommandHandlers) => {
  const detectCommand = useCallback((transcript: string): VoiceCommand | null => {
    const text = transcript.toLowerCase().trim();
    console.log('detectCommand - input text:', text);

    // Navigation commands - check "go to [section]" FIRST before generic next/previous
    if (text.match(/\bgo to\s+(.+)/)) {
      const match = text.match(/\bgo to\s+(.+?)(?:\s+section|\s+page)?$/);
      const sectionName = match ? match[1].trim() : undefined;
      console.log('Detected "go to" command, section name:', sectionName);
      return {
        type: 'navigate',
        params: { direction: 'next', sectionName },
        originalText: transcript
      };
    }

    if (text.match(/\b(next|go to next|move to next)\s*(section|page)?\b/)) {
      console.log('Detected "next" command');
      return {
        type: 'navigate',
        params: { direction: 'next' },
        originalText: transcript
      };
    }

    if (text.match(/\b(previous|go back|back|last)\s*(section|page)?\b/)) {
      console.log('Detected "previous" command');
      return {
        type: 'navigate',
        params: { direction: 'previous' },
        originalText: transcript
      };
    }

    // Auto-fill commands - check these BEFORE help commands to avoid conflicts
    // Match: "fill section", "fill this section", "fill the section", "fill current section"
    if (text.includes('fill') && text.includes('section')) {
      console.log('Detected "fill section" command (contains match)');
      return {
        type: 'autofill',
        params: { scope: 'section' },
        originalText: transcript
      };
    }

    // Match: "fill form", "fill the form", "fill entire form", "autofill", "fill it"
    if ((text.includes('fill') && (text.includes('form') || text.includes('questionnaire') || text.includes('everything') || text.includes('all'))) ||
        text.match(/\bautofill\b/) ||
        (text.includes('fill') && text.includes('it'))) {
      console.log('Detected "fill form" command (contains match)');
      return {
        type: 'autofill',
        params: { scope: 'form' },
        originalText: transcript
      };
    }

    // Submit commands
    if (text.match(/\b(submit|send|finish)\s*(form|questionnaire)?\b/)) {
      return {
        type: 'submit',
        originalText: transcript
      };
    }

    // Save commands
    if (text.match(/\b(save|save\s*draft|save\s*progress)\b/)) {
      return {
        type: 'save',
        originalText: transcript
      };
    }

    // Progress commands
    if (text.match(/\b(show|what's|what\s*is)\s*(my|the)?\s*progress\b/)) {
      return {
        type: 'progress',
        originalText: transcript
      };
    }

    // Field update commands - check BEFORE help commands to avoid conflicts
    // Pattern 1: "set [field] to/as [value]" or "change [field] to/as [value]"
    const setPattern = /\b(set|change|update)\s+(.+?)\s+(?:to|as)\s+(.+)/i;
    const setMatch = text.match(setPattern);
    if (setMatch) {
      const fieldName = setMatch[2].trim();
      const fieldValue = setMatch[3].trim();
      console.log('Detected "set field to/as value" command:', fieldName, '=', fieldValue);
      return {
        type: 'field_update',
        params: { fieldName, fieldValue },
        originalText: transcript
      };
    }

    // Pattern 2: "answer [value] for [field]" or "select [value] for [field]"
    const answerPattern = /\b(answer|select|choose)\s+(.+?)\s+(?:for|to)\s+(.+)/i;
    const answerMatch = text.match(answerPattern);
    if (answerMatch) {
      const fieldValue = answerMatch[2].trim();
      const fieldName = answerMatch[3].trim();
      console.log('Detected "answer value for field" command:', fieldName, '=', fieldValue);
      return {
        type: 'field_update',
        params: { fieldName, fieldValue },
        originalText: transcript
      };
    }

    // Pattern 3: "select [value]" or "choose [value]" (for current focused field)
    const selectPattern = /\b(select|choose|pick)\s+(.+)/i;
    const selectMatch = text.match(selectPattern);
    if (selectMatch && !text.includes('section') && !text.includes('page')) {
      const fieldValue = selectMatch[2].trim();
      console.log('Detected "select value" command:', fieldValue);
      return {
        type: 'field_update',
        params: { fieldName: '_current_', fieldValue },
        originalText: transcript
      };
    }

    // Help commands
    if (text.match(/\b(what\s*is|explain|tell\s*me\s*about|help\s*with)\s+(.+)/)) {
      const match = text.match(/\b(what\s*is|explain|tell\s*me\s*about|help\s*with)\s+(.+)/);
      const topic = match ? match[2].trim() : undefined;
      return {
        type: 'help',
        params: { topic },
        originalText: transcript
      };
    }

    if (text.match(/\b(help|need\s*help|assist|assistance)\b/)) {
      return {
        type: 'help',
        originalText: transcript
      };
    }

    // Repeat command
    if (text.match(/\b(repeat|say\s*that\s*again|what\s*did\s*you\s*say)\b/)) {
      return {
        type: 'repeat',
        originalText: transcript
      };
    }

    // Exit commands
    if (text.match(/\b(exit|stop|close|disable)\s*(voice\s*mode|voice\s*assistant)?\b/)) {
      return {
        type: 'exit',
        originalText: transcript
      };
    }

    // No command detected
    return null;
  }, []);

  const executeCommand = useCallback((command: VoiceCommand): boolean => {
    console.log('executeCommand called:', command.type, command.params);
    switch (command.type) {
      case 'navigate':
        console.log('Navigate case - handler exists:', !!handlers.onNavigate, 'direction:', command.params?.direction);
        if (handlers.onNavigate && command.params?.direction) {
          console.log('Executing navigate handler');
          handlers.onNavigate(command.params.direction, command.params.sectionName);
          return true;
        }
        console.log('Navigate handler not executed');
        break;

      case 'autofill':
        console.log('Autofill case - handler exists:', !!handlers.onAutoFill, 'scope:', command.params?.scope);
        if (handlers.onAutoFill && command.params?.scope) {
          console.log('Executing autofill handler');
          handlers.onAutoFill(command.params.scope);
          return true;
        }
        console.log('Autofill handler not executed');
        break;

      case 'submit':
        if (handlers.onSubmit) {
          handlers.onSubmit();
          return true;
        }
        break;

      case 'help':
        if (handlers.onHelp) {
          handlers.onHelp(command.params?.topic);
          return true;
        }
        break;

      case 'exit':
        if (handlers.onExit) {
          handlers.onExit();
          return true;
        }
        break;

      case 'save':
        if (handlers.onSave) {
          handlers.onSave();
          return true;
        }
        break;

      case 'progress':
        if (handlers.onShowProgress) {
          handlers.onShowProgress();
          return true;
        }
        break;

      case 'repeat':
        if (handlers.onRepeat) {
          handlers.onRepeat();
          return true;
        }
        break;

      case 'field_update':
        console.log('Field update case - handler exists:', !!handlers.onFieldUpdate);
        if (handlers.onFieldUpdate && command.params?.fieldName && command.params?.fieldValue) {
          console.log('Executing field update handler:', command.params.fieldName, '=', command.params.fieldValue);
          handlers.onFieldUpdate(command.params.fieldName, command.params.fieldValue);
          return true;
        }
        console.log('Field update handler not executed');
        break;

      default:
        return false;
    }
    return false;
  }, [handlers]);

  return {
    detectCommand,
    executeCommand,
  };
};

