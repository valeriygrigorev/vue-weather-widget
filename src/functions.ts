const calculateDewPoint = (temperature: number, humidity: number): number => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}

const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const dotToEnd = (str: string) : string => `${str}.`;

export { calculateDewPoint, capitalizeFirstLetter, dotToEnd }