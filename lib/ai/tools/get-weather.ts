import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the weather in a location',
  parameters: z.object({
    city: z.string().describe('The city to get the weather for'),
    country: z
      .string()
      .describe(
        'The country code for this city. Please use ISO 3166 country codes',
      ),
    state: z
      .string()
      .describe(
        "The state code only for the US for this city, else return 'none' value",
      ),
  }),
  execute: async ({ city, country, state }, { abortSignal }) => {
    const addState = state !== 'none' ? `${state},` : '';
    const query = `q=${city},${addState}${country}&limit=1`;
    const getLocation = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?${query}&appid=${process.env.OPEN_WEATHER_API_KEY}`,
      { signal: abortSignal },
    );

    const locations = (await getLocation.json()) as {
      name: string;
      local_names: Record<string, string>;
      lat: number;
      lon: number;
      country: string;
      state: string;
    }[];

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${locations[0].lat}&longitude=${locations[0].lon}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto&forecast_days=3`,
      { signal: abortSignal },
    );

    const weatherData = await response.json();
    return { ...weatherData, city, country, state };
  },
});
