/**
 * KMA Weather API Service
 * Fetches and parses weather observation data from KMA API Hub.
 */

const AUTH_KEY = 'P8lN1gWIRAGJTdYFiPQB6A';
const BASE_URL = 'https://apihub.kma.go.kr/api/typ01/url/kma_sfctm3.php';

export interface DailyWeather {
  date: string; // YYYYMMDD
  icon: string;
  temp?: string;
}

/**
 * Maps KMA observation data to a weather icon.
 * Heuristic based on cloud amount (CA) and precipitation (RN).
 * CA: 0-2 (Clear), 3-5 (Partly Cloudy), 6-8 (Cloudy), 9-10 (Overcast)
 */
export const mapWeatherToIcon = (cloudAmount: number, rain: number, snow: number, temp: number): string => {
  if (snow > 0) return '❄️';
  if (rain > 0) return '🌧️';
  if (cloudAmount <= 2) return '☀️';
  if (cloudAmount <= 5) return '🌤️';
  if (cloudAmount <= 8) return '☁️';
  return '🌫️';
};

/**
 * Fetches weather for a specific station (default 108 - Seoul)
 */
export async function fetchWeeklyWeather(dates: string[]): Promise<Record<string, DailyWeather>> {
  const result: Record<string, DailyWeather> = {};
  
  // To minimize calls, we could fetch a range, but the user requested individual dates usually.
  // For this implementation, we'll fetch the range of the current week.
  const sortedDates = [...dates].sort();
  const tm1 = `${sortedDates[0]}0000`;
  const tm2 = `${sortedDates[sortedDates.length - 1]}2300`;
  
  try {
    const response = await fetch(`${BASE_URL}?tm1=${tm1}&tm2=${tm2}&stn=108&help=0&authKey=${AUTH_KEY}`);
    const text = await response.text();
    
    // Parse the KMA text format
    // Lines starting with # are comments. Data lines start with YYYYMMDDHHMM.
    const lines = text.split('\n');
    const dayData: Record<string, any> = {};

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;
      
      const parts = line.trim().split(/\s+/);
      if (parts.length < 15) continue;

      const timestamp = parts[0]; // YYYYMMDDHHMM
      const date = timestamp.substring(0, 8);
      const hour = timestamp.substring(8, 10);
      
      // We take the data around 12:00 (midday) as the representative weather for the day
      if (hour === '12' || !dayData[date]) {
        const temp = parseFloat(parts[11]); // TA
        const cloud = parseFloat(parts[21]); // CA_TOT (or similar based on column research)
        const rain = parseFloat(parts[15]); // RN
        const snow = parseFloat(parts[19]); // SD_DAY or similar
        
        dayData[date] = {
          temp: parts[11],
          cloud: cloud === -9 ? 0 : cloud,
          rain: rain === -9 ? 0 : rain,
          snow: snow === -9 ? 0 : snow
        };
      }
    }

    for (const date of dates) {
      const data = dayData[date];
      if (data) {
        result[date] = {
          date,
          icon: mapWeatherToIcon(data.cloud, data.rain, data.snow, parseFloat(data.temp)),
          temp: data.temp
        };
      } else {
        // Fallback for future dates or missing data
        result[date] = { date, icon: '❓' };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return {};
  }
}
