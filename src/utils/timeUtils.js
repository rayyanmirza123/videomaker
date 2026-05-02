export const formatTime = (seconds) => {
 if (isNaN(seconds)) return '00:00:00';
 
 const date = new Date(0);
 date.setSeconds(seconds);
 return date.toISOString().substr(11, 8);
};

export const parseTime = (timeString) => {
 const parts = timeString.split(':');
 return (
   parseInt(parts[0]) * 3600 +
   parseInt(parts[1]) * 60 +
   parseFloat(parts[2])
 );
};