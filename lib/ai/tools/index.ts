export type DocumentTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions';

const documentTools: DocumentTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

type GenerateImageTools = 'generateImage';

const generateImageTools: GenerateImageTools[] = ['generateImage'];

type WeatherTools = 'getWeather';

const weatherTools: WeatherTools[] = ['getWeather'];

type AllowedTools = DocumentTools | WeatherTools | GenerateImageTools;

export const allowedTools: AllowedTools[] = [
  ...generateImageTools,
  ...weatherTools,
  ...documentTools,
];

export const isAllowedTool = (tool: string): tool is AllowedTools => {
  return allowedTools.includes(tool as AllowedTools);
};
