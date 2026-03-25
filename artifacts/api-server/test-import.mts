import { buildAnalysisResult } from './src/lib/ai-simulation.js';
import { analyzeRetinalImage } from './src/lib/image-analysis.js';
console.log('ai-simulation OK:', typeof buildAnalysisResult);
console.log('image-analysis OK:', typeof analyzeRetinalImage);
