const documentTools = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
] as const;

export type DocumentTools = (typeof documentTools)[number];

const generateImageTools = ['generateImage'] as const;

const weatherTools = ['getWeather'] as const;

export const allowedTools = [
  ...generateImageTools,
  ...weatherTools,
  ...documentTools,
];

type AllowedTools = (typeof allowedTools)[number];

export const isAllowedTool = (tool: string): tool is AllowedTools => {
  return allowedTools.includes(tool as AllowedTools);
};
