/**
 * KMA Weather API Service
 * Fetches and parses weather observation data from KMA API Hub.
 */

const BASE_URL = '/api/weather';

export interface DailyWeather {
  date: string; // YYYYMMDD
  icon: string;
  temp?: string;
}

/**
 * Maps KMA observation data to a weather icon.
 */
export const mapWeatherToIcon = (cloudAmount: number, rain: number, snow: number, temp: number): string => {
  if (snow > 0) return '❄️';
  if (rain > 0) return '🌧️';
  // cloudAmount is 0-10 or -9 (missing)
  if (cloudAmount === -9 || cloudAmount === 0) return '☀️'; 
  if (cloudAmount <= 5) return '🌤️';
  if (cloudAmount <= 8) return '☁️';
  return '🌫️';
};

/**
 * Fetches weather for a specific station (default 108 - Seoul)
 */
export async function fetchWeeklyWeather(dates: string[]): Promise<Record<string, DailyWeather>> {
  const result: Record<string, DailyWeather> = {};
  
  const sortedDates = [...dates].sort();
  // KMA expects 12 digits: YYYYMMDDHHMM
  const tm1 = `${sortedDates[0]}0000`;
  const tm2 = `${sortedDates[sortedDates.length - 1]}2300`;
  
  try {
    // Calling our internal API proxy
    const response = await fetch(`${BASE_URL}?tm1=${tm1}&tm2=${tm2}&stn=108`);
    if (!response.ok) throw new Error('API proxy returned error');
    
    const text = await response.text();
    
    const lines = text.split('\n');
    const dayData: Record<string, any> = {};

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') continue;
      
      const parts = line.trim().split(/\s+/);
      if (parts.length < 15) continue;

      const timestamp = parts[0]; 
      const date = timestamp.substring(0, 8);
      const hour = timestamp.substring(8, 10);
      
      const temp = parseFloat(parts[11]);
      const rain = parseFloat(parts[15]);
      const snow = parseFloat(parts[19]);
      const cloud = parts.length > 24 ? parseFloat(parts[24]) : -9;
      
      // 12:00 데이터를 우선적으로 사용하되, 없으면 가장 최신(마지막) 데이터를 사용
      if (hour === '12' || !dayData[date] || parseInt(hour) > parseInt(dayData[date].hour)) {
        dayData[date] = {
          hour,
          temp: parts[11],
          cloud: cloud,
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
        result[date] = { date, icon: '❓' };
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return {};
  }
}
