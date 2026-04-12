
interface OpeningHours {
  [key: string]: string;
}

export const parseOpeningHours = (hoursString: string): OpeningHours => {
  try {
    return JSON.parse(hoursString);
  } catch {
    return {};
  }
};

export const isOpen = (openingHours: OpeningHours): boolean => {
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

  // Mapping French day names
  const dayMapping: { [key: string]: string } = {
    'lundi': 'lundi',
    'mardi': 'mardi',
    'mercredi': 'mercredi',
    'jeudi': 'jeudi',
    'vendredi': 'vendredi',
    'samedi': 'samedi',
    'dimanche': 'dimanche'
  };

  const todaySchedule = openingHours[dayMapping[dayName]];
  
  if (!todaySchedule || todaySchedule === 'Fermé') {
    return false;
  }

  // Handle special case for 24/7
  if (todaySchedule === 'Ouvert 24h/24') {
    return true;
  }

  // Parse time ranges (e.g., "11:30-14:15,18:00-22:30")
  const timeRanges = todaySchedule.split(',');
  
  for (const range of timeRanges) {
    const [start, end] = range.split('-');
    if (start && end) {
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      let endTime = endHour * 60 + endMinute;
      
      // Handle midnight crossing (e.g., 18:00-02:00)
      if (endTime < startTime) {
        endTime += 24 * 60;
        // Check if current time is after start time or before end time (next day)
        if (currentTime >= startTime || currentTime <= (endTime - 24 * 60)) {
          return true;
        }
      } else {
        // Normal case
        if (currentTime >= startTime && currentTime <= endTime) {
          return true;
        }
      }
    }
  }
  
  return false;
};

export const getTodayHours = (openingHours: OpeningHours): string => {
  const now = new Date();
  const parisTime = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long'
  }).formatToParts(now);

  const dayName = parisTime.find(part => part.type === 'weekday')?.value.toLowerCase() || '';
  
  const dayMapping: { [key: string]: string } = {
    'lundi': 'lundi',
    'mardi': 'mardi',
    'mercredi': 'mercredi',
    'jeudi': 'jeudi',
    'vendredi': 'vendredi',
    'samedi': 'samedi',
    'dimanche': 'dimanche'
  };

  const schedule = openingHours[dayMapping[dayName]];
  
  if (!schedule) {
    return 'Horaires non disponibles';
  }
  
  if (schedule === 'Fermé') {
    return 'Fermé aujourd\'hui';
  }
  
  if (schedule === 'Ouvert 24h/24') {
    return 'Ouvert 24h/24';
  }
  
  // Format time ranges to be more readable
  return schedule.replace(',', ' et ');
};
