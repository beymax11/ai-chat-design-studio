import { LanguageCode, SUPPORTED_LANGUAGES } from '@/contexts/TranslationContext';

/**
 * Detects if a user message contains a language request
 * Returns the requested language code if found, null otherwise
 */
export const detectLanguageRequest = (message: string): LanguageCode | null => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Language request patterns in multiple languages
  const languagePatterns: Array<{
    pattern: RegExp;
    language: LanguageCode;
  }> = [
    // English patterns
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(english|en)\b/i, language: 'en' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(spanish|es)\b/i, language: 'es' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(french|fr)\b/i, language: 'fr' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(german|de)\b/i, language: 'de' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(italian|it)\b/i, language: 'it' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(portuguese|pt)\b/i, language: 'pt' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(chinese|zh)\b/i, language: 'zh' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(japanese|ja)\b/i, language: 'ja' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(korean|ko)\b/i, language: 'ko' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(arabic|ar)\b/i, language: 'ar' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(hindi|hi)\b/i, language: 'hi' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(russian|ru)\b/i, language: 'ru' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(dutch|nl)\b/i, language: 'nl' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(polish|pl)\b/i, language: 'pl' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(turkish|tr)\b/i, language: 'tr' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(vietnamese|vi)\b/i, language: 'vi' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(thai|th)\b/i, language: 'th' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(indonesian|id)\b/i, language: 'id' },
    { pattern: /\b(answer|respond|reply|speak|write|explain|tell)\s+(me\s+)?(in|using|with)\s+(filipino|tagalog|tl)\b/i, language: 'tl' },
    
    // Filipino/Tagalog patterns
    { pattern: /\b(sagutin|sumagot|magbigay|mag-explain|magkwento)\s+(mo|ninyo|ka)\s+(sa|gamit|ng)\s+(filipino|tagalog|pilipino)\b/i, language: 'tl' },
    { pattern: /\b(sagutin|sumagot|magbigay|mag-explain|magkwento)\s+(mo|ninyo|ka)\s+(sa|gamit|ng)\s+(english|ingles)\b/i, language: 'en' },
    { pattern: /\b(sagutin|sumagot|magbigay|mag-explain|magkwento)\s+(mo|ninyo|ka)\s+(sa|gamit|ng)\s+(espanol|kastila)\b/i, language: 'es' },
    
    // Direct language mentions
    { pattern: /\b(english|en)\s+(please|lang|only)\b/i, language: 'en' },
    { pattern: /\b(spanish|espanol|es)\s+(please|lang|only)\b/i, language: 'es' },
    { pattern: /\b(french|francais|fr)\s+(please|lang|only)\b/i, language: 'fr' },
    { pattern: /\b(german|deutsch|de)\s+(please|lang|only)\b/i, language: 'de' },
    { pattern: /\b(italian|italiano|it)\s+(please|lang|only)\b/i, language: 'it' },
    { pattern: /\b(portuguese|portugues|pt)\s+(please|lang|only)\b/i, language: 'pt' },
    { pattern: /\b(chinese|zhongwen|zh)\s+(please|lang|only)\b/i, language: 'zh' },
    { pattern: /\b(japanese|nihongo|ja)\s+(please|lang|only)\b/i, language: 'ja' },
    { pattern: /\b(korean|hangugeo|ko)\s+(please|lang|only)\b/i, language: 'ko' },
    { pattern: /\b(arabic|ar)\s+(please|lang|only)\b/i, language: 'ar' },
    { pattern: /\b(hindi|hi)\s+(please|lang|only)\b/i, language: 'hi' },
    { pattern: /\b(russian|russkiy|ru)\s+(please|lang|only)\b/i, language: 'ru' },
    { pattern: /\b(dutch|nederlands|nl)\s+(please|lang|only)\b/i, language: 'nl' },
    { pattern: /\b(polish|polski|pl)\s+(please|lang|only)\b/i, language: 'pl' },
    { pattern: /\b(turkish|turkce|tr)\s+(please|lang|only)\b/i, language: 'tr' },
    { pattern: /\b(vietnamese|tieng viet|vi)\s+(please|lang|only)\b/i, language: 'vi' },
    { pattern: /\b(thai|th)\s+(please|lang|only)\b/i, language: 'th' },
    { pattern: /\b(indonesian|bahasa indonesia|id)\s+(please|lang|only)\b/i, language: 'id' },
    { pattern: /\b(filipino|tagalog|pilipino|tl)\s+(please|lang|only)\b/i, language: 'tl' },
    
    // Translation request patterns
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(english|en)\b/i, language: 'en' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(spanish|espanol|es)\b/i, language: 'es' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(french|francais|fr)\b/i, language: 'fr' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(german|deutsch|de)\b/i, language: 'de' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(italian|italiano|it)\b/i, language: 'it' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(portuguese|portugues|pt)\b/i, language: 'pt' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(chinese|zhongwen|zh)\b/i, language: 'zh' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(japanese|nihongo|ja)\b/i, language: 'ja' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(korean|hangugeo|ko)\b/i, language: 'ko' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(arabic|ar)\b/i, language: 'ar' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(hindi|hi)\b/i, language: 'hi' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(russian|russkiy|ru)\b/i, language: 'ru' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(dutch|nederlands|nl)\b/i, language: 'nl' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(polish|polski|pl)\b/i, language: 'pl' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(turkish|turkce|tr)\b/i, language: 'tr' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(vietnamese|tieng viet|vi)\b/i, language: 'vi' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(thai|th)\b/i, language: 'th' },
    { pattern: /\b(translate|translation)\s+(to|into|in)\s+(indonesian|bahasa indonesia|id)\b/i, language: 'id' },
    { pattern: /\b(translate|translation|isalin)\s+(to|into|in|sa)\s+(filipino|tagalog|pilipino|tl)\b/i, language: 'tl' },
  ];

  // Check each pattern
  for (const { pattern, language } of languagePatterns) {
    if (pattern.test(lowerMessage)) {
      return language;
    }
  }

  // Check for language names in the message
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.code === 'auto-detect') continue;
    
    const langNames = [
      lang.name.toLowerCase(),
      lang.nativeName.toLowerCase(),
      lang.code.toLowerCase(),
    ];
    
    // Check if language name appears with request keywords
    const requestKeywords = [
      'in', 'using', 'with', 'to', 'into', 'sa', 'gamit', 'ng',
      'answer', 'respond', 'reply', 'speak', 'write', 'explain',
      'sagutin', 'sumagot', 'magbigay', 'mag-explain', 'magkwento',
      'translate', 'translation', 'isalin'
    ];
    
    for (const langName of langNames) {
      for (const keyword of requestKeywords) {
        const regex = new RegExp(`\\b${keyword}\\s+${langName}\\b|\\b${langName}\\s+${keyword}\\b`, 'i');
        if (regex.test(lowerMessage)) {
          return lang.code;
        }
      }
    }
  }

  return null;
};

