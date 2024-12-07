import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the weather in a location',
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string().describe('The city to get the weather for'),
  }),
  execute: async ({ latitude, longitude, city }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto&forecast_days=3`,
    );

    const weatherData = await response.json();
    return { ...weatherData, city };
  },
});
