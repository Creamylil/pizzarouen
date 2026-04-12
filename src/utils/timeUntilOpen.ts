
import { parseOpeningHours } from './openingHours';

export const getTimeUntilOpen = (openingHours: string): string | null => {
  try {
    const hours = parseOpeningHours(openingHours);
    const now = new Date();
    const parisTime = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(now);

    const dayName = parisTime.find(part => part.type === 'weekday')?.value.toLowerCase() || '';
    const currentHour = parseInt(parisTime.find(part => part.type === 'hour')?.value || '0');
    const currentMinute = parseInt(parisTime.find(part => part.type === 'minute')?.value || '0');
    const currentTime = currentHour * 60 + currentMinute;

    const dayMapping: { [key: string]: string } = {
      'lundi': 'lundi',
      'mardi': 'mardi',
      'mercredi': 'mercredi',
      'jeudi': 'jeudi',
      'vendredi': 'vendredi',
      'samedi': 'samedi',
      'dimanche': 'dimanche'
    };

    const todaySchedule = hours[dayMapping[dayName]];
    
    if (!todaySchedule || todaySchedule === 'Fermé') {
      // Chercher le prochain jour d'ouverture
      const daysOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      const currentDayIndex = daysOrder.indexOf(dayMapping[dayName]);
      
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDayIndex + i) % 7;
        const nextDaySchedule = hours[daysOrder[nextDayIndex]];
        
        if (nextDaySchedule && nextDaySchedule !== 'Fermé') {
          const nextDayName = daysOrder[nextDayIndex];
          const dayNames = {
            'lundi': 'lundi',
            'mardi': 'mardi', 
            'mercredi': 'mercredi',
            'jeudi': 'jeudi',
            'vendredi': 'vendredi',
            'samedi': 'samedi',
            'dimanche': 'dimanche'
          };
          return `Ouvert ${dayNames[nextDayName as keyof typeof dayNames]}`;
        }
      }
      return null;
    }

    if (todaySchedule === 'Ouvert 24h/24') {
      return null;
    }

    // Parse les heures d'ouverture d'aujourd'hui
    const timeRanges = todaySchedule.split(',');
    
    for (const range of timeRanges) {
      const [start] = range.split('-');
      if (start) {
        const [startHour, startMinute] = start.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        
        if (currentTime < startTime) {
          const minutesUntilOpen = startTime - currentTime;
          
          if (minutesUntilOpen < 60) {
            return `Ouvre dans ${minutesUntilOpen} minute${minutesUntilOpen > 1 ? 's' : ''}`;
          } else {
            const hours = Math.floor(minutesUntilOpen / 60);
            const minutes = minutesUntilOpen % 60;
            if (minutes === 0) {
              return `Ouvre dans ${hours}h`;
            }
            return `Ouvre dans ${hours}h${minutes.toString().padStart(2, '0')}`;
          }
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
};
