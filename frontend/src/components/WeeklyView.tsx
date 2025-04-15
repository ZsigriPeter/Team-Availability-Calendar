import React from 'react';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyView = () => {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-8 min-w-max border border-gray-300">
        <div className="bg-gray-100 p-2 font-bold border-r border-b">Time</div>
        {days.map(day => (
          <div key={day} className="bg-gray-100 p-2 font-bold text-center border-r border-b">
            {day}
          </div>
        ))}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="p-2 border-r border-b bg-gray-50 font-mono text-sm">{hour}</div>
            {days.map(day => (
              <div
                key={`${day}-${hour}`}
                className="p-2 border-r border-b hover:bg-blue-100 cursor-pointer text-sm text-center"
              >
                {/* Can show status or allow interaction here */}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;
