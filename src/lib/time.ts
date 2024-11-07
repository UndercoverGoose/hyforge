/**
 * Convert a time string to seconds
 * @param time - The time string to convert
 * @returns The time in seconds
 */
export function to_seconds(time: string) {
  const days = time.match(/(\d+)d/)?.[0] || '0';
  const hours = time.match(/(\d+)h/)?.[0] || '0';
  const minutes = time.match(/(\d+)m/)?.[0] || '0';
  const seconds = time.match(/(\d+)s/)?.[0] || '0';
  return parseInt(days) * 86400 + parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}
/**
 * Convert a time in seconds to a time string
 * @param time - The time in seconds to convert
 * @returns The time string
 */
export function from_seconds(time: number) {
  time = Math.round(time);
  const days = Math.floor(time / 86400);
  const hours = Math.floor((time % 86400) / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds ? seconds + 's ' : ''}`.trim();
}
