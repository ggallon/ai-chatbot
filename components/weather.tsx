import cx from 'classnames';
import { format, isWithinInterval } from 'date-fns';
import { Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeatherAtLocation {
  city: string;
  country: string;
  state: string;
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily_units: {
    time: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}

const SAMPLE = {
  city: 'Bordeaux',
  country: 'FR',
  state: 'none',
  latitude: 44.84,
  longitude: -0.58,
  generationtime_ms: 0.053048,
  utc_offset_seconds: 0,
  timezone: 'GMT',
  timezone_abbreviation: 'GMT',
  elevation: 19.0,
  current_units: { time: 'iso8601', interval: 'seconds', temperature_2m: '°C' },
  current: { time: '2024-12-05T23:15', interval: 900, temperature_2m: 14.5 },
  hourly_units: { time: 'iso8601', temperature_2m: '°C' },
  hourly: {
    time: [
      '2024-12-05T00:00',
      '2024-12-05T01:00',
      '2024-12-05T02:00',
      '2024-12-05T03:00',
      '2024-12-05T04:00',
      '2024-12-05T05:00',
      '2024-12-05T06:00',
      '2024-12-05T07:00',
      '2024-12-05T08:00',
      '2024-12-05T09:00',
      '2024-12-05T10:00',
      '2024-12-05T11:00',
      '2024-12-05T12:00',
      '2024-12-05T13:00',
      '2024-12-05T14:00',
      '2024-12-05T15:00',
      '2024-12-05T16:00',
      '2024-12-05T17:00',
      '2024-12-05T18:00',
      '2024-12-05T19:00',
      '2024-12-05T20:00',
      '2024-12-05T21:00',
      '2024-12-05T22:00',
      '2024-12-05T23:00',
      '2024-12-06T00:00',
      '2024-12-06T01:00',
      '2024-12-06T02:00',
      '2024-12-06T03:00',
      '2024-12-06T04:00',
      '2024-12-06T05:00',
      '2024-12-06T06:00',
      '2024-12-06T07:00',
      '2024-12-06T08:00',
      '2024-12-06T09:00',
      '2024-12-06T10:00',
      '2024-12-06T11:00',
      '2024-12-06T12:00',
      '2024-12-06T13:00',
      '2024-12-06T14:00',
      '2024-12-06T15:00',
      '2024-12-06T16:00',
      '2024-12-06T17:00',
      '2024-12-06T18:00',
      '2024-12-06T19:00',
      '2024-12-06T20:00',
      '2024-12-06T21:00',
      '2024-12-06T22:00',
      '2024-12-06T23:00',
      '2024-12-07T00:00',
      '2024-12-07T01:00',
      '2024-12-07T02:00',
      '2024-12-07T03:00',
      '2024-12-07T04:00',
      '2024-12-07T05:00',
      '2024-12-07T06:00',
      '2024-12-07T07:00',
      '2024-12-07T08:00',
      '2024-12-07T09:00',
      '2024-12-07T10:00',
      '2024-12-07T11:00',
      '2024-12-07T12:00',
      '2024-12-07T13:00',
      '2024-12-07T14:00',
      '2024-12-07T15:00',
      '2024-12-07T16:00',
      '2024-12-07T17:00',
      '2024-12-07T18:00',
      '2024-12-07T19:00',
      '2024-12-07T20:00',
      '2024-12-07T21:00',
      '2024-12-07T22:00',
      '2024-12-07T23:00',
    ],
    temperature_2m: [
      3.1, 3.1, 2.7, 2.7, 2.7, 2.9, 3.7, 4.1, 4.4, 4.9, 6.1, 7.5, 9.0, 9.7,
      10.6, 13.1, 12.8, 12.8, 12.7, 12.9, 13.1, 14.2, 14.6, 14.5, 14.5, 15.1,
      15.8, 15.4, 14.9, 14.6, 14.4, 13.6, 12.7, 12.7, 13.4, 13.7, 13.7, 13.8,
      14.0, 14.5, 13.7, 12.9, 12.7, 12.9, 13.1, 13.8, 14.4, 14.4, 14.2, 14.1,
      14.2, 14.3, 14.6, 14.5, 14.3, 13.0, 12.7, 11.7, 11.3, 11.1, 10.4, 9.9,
      9.3, 8.8, 8.1, 7.9, 7.7, 7.8, 7.9, 7.8, 7.4, 7.6,
    ],
  },
  daily_units: {
    time: 'iso8601',
    sunrise: 'iso8601',
    sunset: 'iso8601',
  },
  daily: {
    time: ['2024-12-05', '2024-12-06', '2024-12-07'],
    sunrise: ['2024-12-05T07:24', '2024-12-06T07:25', '2024-12-07T07:26'],
    sunset: ['2024-12-05T16:21', '2024-12-06T16:21', '2024-12-07T16:21'],
  },
};

function n(num: number): number {
  return Math.ceil(num);
}

export function Weather({
  weatherAtLocation = SAMPLE,
}: {
  weatherAtLocation?: WeatherAtLocation;
}) {
  const currentHigh = Math.max(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24),
  );
  const currentLow = Math.min(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24),
  );

  const isDay = isWithinInterval(new Date(weatherAtLocation.current.time), {
    start: new Date(weatherAtLocation.daily.sunrise[0]),
    end: new Date(weatherAtLocation.daily.sunset[0]),
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hoursToShow = isMobile ? 5 : 6;

  // Find the index of the current time or the next closest time
  const currentTimeIndex = weatherAtLocation.hourly.time.findIndex(
    (time) => new Date(time) >= new Date(weatherAtLocation.current.time),
  );

  // Slice the arrays to get the desired number of items
  const displayTimes = weatherAtLocation.hourly.time.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  );

  const displayTemperatures = weatherAtLocation.hourly.temperature_2m.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  );

  return (
    <div
      className={cx(
        'flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px]',
        {
          'bg-blue-400': isDay,
        },
        {
          'bg-indigo-900': !isDay,
        },
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col text-blue-50 items-start">
          <div className="flex items-center text-base">
            <p className="text-base font-semibold">{weatherAtLocation.city}</p>
            <Navigation className="size-3 ml-1.5" />
          </div>
          <p className="text-4xl font-medium">
            {n(weatherAtLocation.current.temperature_2m)}°
          </p>
        </div>

        <div className="flex flex-col text-blue-50 items-end gap-2">
          <div
            className={cx(
              'size-6 rounded-full skeleton-div',
              {
                'bg-yellow-300': isDay,
              },
              {
                'bg-indigo-100': !isDay,
              },
            )}
          />
          <div className="flex gap-1 font-medium">
            <span>↑ {n(currentHigh)}°</span>
            <span>↓ {n(currentLow)}°</span>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        {displayTimes.map((time, index) => (
          <div key={time} className="flex flex-col items-center gap-1">
            <div className="text-blue-100 text-xs font-medium">
              {format(new Date(time), "HH 'h'")}
            </div>
            <div
              className={cx(
                'size-6 rounded-full skeleton-div',
                {
                  'bg-yellow-300': isDay,
                },
                {
                  'bg-indigo-200': !isDay,
                },
              )}
            />
            <div className="text-blue-50 text-sm font-bold">
              {n(displayTemperatures[index])}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
