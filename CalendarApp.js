document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentDate = new Date();
    let selectedDate = null;
    let events = loadEvents();

    // DOM Elements
    const calendar = document.getElementById('calendar');
    const monthDisplay = document.getElementById('monthDisplay');
    const yearDisplay = document.getElementById('yearDisplay');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const prevYearBtn = document.getElementById('prevYear');
    const nextYearBtn = document.getElementById('nextYear');
    const eventTitleInput = document.getElementById('eventTitleInput');
    const eventTimeInput = document.getElementById('eventTimeInput');
    const eventDescriptionInput = document.getElementById('eventDescriptionInput');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const eventsList = document.getElementById('eventsList');
    const notification = document.getElementById('notification');

    // Event Listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    prevYearBtn.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        updateCalendar();
    });

    nextYearBtn.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        updateCalendar();
    });

    saveButton.addEventListener('click', saveEvent);
    cancelButton.addEventListener('click', resetForm);
    
    // Form validation
    [eventTitleInput, eventTimeInput, eventDescriptionInput].forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // Initialize
    updateCalendar();

    // Calendar Functions
    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update header
        monthDisplay.textContent = new Date(year, month).toLocaleString('default', { month: 'long' });
        yearDisplay.textContent = year;

        // Clear calendar
        calendar.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Get previous month's days that show in current month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const prevMonthDays = startingDay;

        // Get next month's days that show in current month
        const nextMonthDays = 42 - (prevMonthDays + totalDays); // 42 is 6 rows * 7 days

        // Render previous month's days
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const dayDiv = createDayElement(prevMonthLastDay - i, true);
            calendar.appendChild(dayDiv);
        }

        // Render current month's days
        for (let i = 1; i <= totalDays; i++) {
            const dayDiv = createDayElement(i, false);
            calendar.appendChild(dayDiv);
        }

        // Render next month's days
        for (let i = 1; i <= nextMonthDays; i++) {
            const dayDiv = createDayElement(i, true);
            calendar.appendChild(dayDiv);
        }

        updateEventsList();
    }

    function createDayElement(day, isOtherMonth) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (isOtherMonth) dayDiv.classList.add('other-month');

        const date = new Date(
            currentDate.getFullYear(),
            isOtherMonth ? (day > 15 ? currentDate.getMonth() - 1 : currentDate.getMonth() + 1) : currentDate.getMonth(),
            day
        );

        // Check if it's today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }

        // Check if it's selected
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayDiv.classList.add('selected');
        }

        // Add day number
        dayDiv.textContent = day;

        // Add event indicator if events exist for this day
        const dayEvents = events.filter(event => 
            new Date(event.date).toDateString() === date.toDateString()
        );
        
        if (dayEvents.length > 0) {
            const dot = document.createElement('div');
            dot.className = 'event-dot';
            dayDiv.appendChild(dot);
        }

        // Add click handler
        dayDiv.addEventListener('click', () => selectDate(date));

        return dayDiv;
    }

    function selectDate(date) {
        selectedDate = date;
        resetForm();
        updateCalendar();
        showNotification(`Selected ${date.toLocaleDateString()}`);
    }

    // Event Functions
    function saveEvent() {
        if (!selectedDate || !eventTitleInput.value.trim()) {
            showNotification('Please select a date and enter an event title', true);
            return;
        }

        const newEvent = {
            id: Date.now(),
            date: selectedDate,
            title: eventTitleInput.value.trim(),
            time: eventTimeInput.value,
            description: eventDescriptionInput.value.trim()
        };

        events.push(newEvent);
        saveEvents();
        updateCalendar();
        resetForm();
        showNotification('Event saved successfully');
    }

    function deleteEvent(eventId) {
        events = events.filter(event => event.id !== eventId);
        saveEvents();
        updateCalendar();
        showNotification('Event deleted');
    }

    function updateEventsList() {
        eventsList.innerHTML = '';
        const todayEvents = events.filter(event => 
            new Date(event.date).toDateString() === (selectedDate || new Date()).toDateString()
        );

        if (todayEvents.length === 0) {
            eventsList.innerHTML = '<p class="no-events">No events for this day</p>';
            return;
        }

        todayEvents
            .sort((a, b) => a.time.localeCompare(b.time))
            .forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = `
                    <div class="event-title">${event.title}</div>
                    ${event.time ? `<div class="event-time">${formatTime(event.time)}</div>` : ''}
                    ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                    <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
                `;
                eventsList.appendChild(eventElement);
            });
    }

    // Utility Functions
    function validateForm() {
        const isValid = eventTitleInput.value.trim() !== '';
        saveButton.disabled = !isValid;
        saveButton.style.opacity = isValid ? '1' : '0.5';
    }

    function resetForm() {
        eventTitleInput.value = '';
        eventTimeInput.value = '';
        eventDescriptionInput.value = '';
        validateForm();
    }

    function formatTime(time) {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = `notification ${isError ? 'error' : ''} show`;
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }

    function loadEvents() {
        const savedEvents = localStorage.getItem('calendarEvents');
        return savedEvents ? JSON.parse(savedEvents) : [];
    }

    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }

    // Make deleteEvent globally available
    window.deleteEvent = deleteEvent;
});