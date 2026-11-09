/* All demo records live in one replaceable data layer. No framework or server required. */
(function () {
  'use strict';
  const STORAGE_KEY = 'eventos_records_v2';
  const TYPES = ['events', 'participants', 'registrations', 'schedules'];

  function dateAt(days, hours, minutes = 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hours, minutes, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function seeds() {
    return {
      events: [
        { id: 'e1', title: 'Design & Culture Forum', type: 'Conference', venue: 'The Commons Hall', startsAt: dateAt(12, 9), endsAt: dateAt(12, 17), capacity: 180, status: 'Open' },
        { id: 'e2', title: 'Campus Creatives Workshop', type: 'Workshop', venue: 'Studio 2', startsAt: dateAt(19, 13), endsAt: dateAt(19, 17), capacity: 40, status: 'Open' },
        { id: 'e3', title: 'Community Partners Meet', type: 'Seminar', venue: 'Civic Center', startsAt: dateAt(27, 10), endsAt: dateAt(27, 12), capacity: 90, status: 'Planned' },
        { id: 'e4', title: 'Annual Recognition Night', type: 'Social', venue: 'Garden Pavilion', startsAt: dateAt(40, 18), endsAt: dateAt(40, 21), capacity: 150, status: 'Open' }
      ],
      participants: [
        { id: 'p1', fullName: 'Alex Rivera', email: 'alex.rivera@example.com', phone: '09171234567', organization: 'North Studio' },
        { id: 'p2', fullName: 'Jamie Cruz', email: 'jamie.cruz@example.com', phone: '09182345678', organization: 'City College' },
        { id: 'p3', fullName: 'Morgan Reyes', email: 'morgan.reyes@example.com', phone: '09193456789', organization: 'Independent' },
        { id: 'p4', fullName: 'Taylor Santos', email: 'taylor.santos@example.com', phone: '09194567890', organization: 'Creative Network' },
        { id: 'p5', fullName: 'Jordan Lee', email: 'user@example.com', phone: '09195678901', organization: 'Guest' }
      ],
      registrations: [
        { id: 'r1', eventId: 'e1', participantId: 'p1', status: 'Confirmed', registeredAt: dateAt(-4, 14) },
        { id: 'r2', eventId: 'e1', participantId: 'p2', status: 'Confirmed', registeredAt: dateAt(-3, 10) },
        { id: 'r3', eventId: 'e2', participantId: 'p3', status: 'Waitlisted', registeredAt: dateAt(-2, 9) },
        { id: 'r4', eventId: 'e4', participantId: 'p4', status: 'Confirmed', registeredAt: dateAt(-1, 15) }
      ],
      schedules: [
        { id: 's1', eventId: 'e1', title: 'Doors open & check-in', startsAt: dateAt(12, 9), endsAt: dateAt(12, 10), location: 'Main lobby' },
        { id: 's2', eventId: 'e1', title: 'Opening session', startsAt: dateAt(12, 10), endsAt: dateAt(12, 11), location: 'Main hall' },
        { id: 's3', eventId: 'e2', title: 'Workshop session', startsAt: dateAt(19, 13), endsAt: dateAt(19, 16), location: 'Studio 2' }
      ]
    };
  }
  let inMemory = null;
  function read() {
    if (inMemory) return inMemory;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && TYPES.every(t => Array.isArray(parsed[t]))) {
        inMemory = parsed;
        return inMemory;
      }
    } catch (error) { /* Browser may block storage; in-memory session still works. */ }
    inMemory = seeds();
    persist();
    return inMemory;
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemory)); }
    catch (error) { /* No persistent storage available; keep current session data. */ }
  }
  function all(type) {
    if (!TYPES.includes(type)) throw new Error('Unknown record type.');
    return read()[type].map(item => ({ ...item }));
  }
  function get(type, id) { return all(type).find(item => item.id === id) || null; }
  function countConfirmed(eventId, exceptId = '') {
    return read().registrations.filter(r => r.eventId === eventId && r.status === 'Confirmed' && r.id !== exceptId).length;
  }
  function valid(type, record) {
    const db = read();
    if (type === 'events') {
      if (new Date(record.endsAt) <= new Date(record.startsAt)) throw new Error('End time must be later than start time.');
      if (!Number.isInteger(Number(record.capacity)) || Number(record.capacity) < 1) throw new Error('Capacity must be at least 1.');
      if (Number(record.capacity) < countConfirmed(record.id)) throw new Error('Capacity cannot be lower than confirmed registrations.');
      if (record.id && db.schedules.some(s => s.eventId === record.id && (s.startsAt < record.startsAt || s.endsAt > record.endsAt))) {
        throw new Error('An existing schedule entry is outside the new event time.');
      }
    }
    if (type === 'participants') {
      if (record.email && db.participants.some(p => p.id !== record.id && p.email && p.email.toLowerCase() === record.email.toLowerCase())) {
        throw new Error('This email address is already registered.');
      }
    }
    if (type === 'registrations') {
      if (!get('events', record.eventId) || !get('participants', record.participantId)) throw new Error('Choose a valid event and participant.');
      if (db.registrations.some(r => r.id !== record.id && r.eventId === record.eventId && r.participantId === record.participantId)) {
        throw new Error('This participant is already registered for that event.');
      }
      if (record.status === 'Confirmed' && countConfirmed(record.eventId, record.id) >= Number(get('events', record.eventId).capacity)) {
        throw new Error('This event has reached capacity.');
      }
    }
    if (type === 'schedules') {
      const event = get('events', record.eventId);
      if (!event) throw new Error('Choose a valid event.');
      if (record.endsAt <= record.startsAt) throw new Error('End time must be later than start time.');
      if (record.startsAt < event.startsAt || record.endsAt > event.endsAt) throw new Error('Schedule must fall within the event start and end times.');
    }
  }
  function save(type, record) {
    if (!TYPES.includes(type)) throw new Error('Unknown record type.');
    const db = read();
    const now = new Date().toISOString();
    const clean = { ...record };
    if (type === 'events') clean.capacity = Number(clean.capacity);
    if (!clean.id) clean.id = `${type[0]}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    if (type === 'registrations' && !clean.registeredAt) clean.registeredAt = now;
    valid(type, clean);
    const index = db[type].findIndex(item => item.id === clean.id);
    if (index >= 0) db[type][index] = clean;
    else db[type].push(clean);
    persist();
    return { ...clean };
  }
  function remove(type, id) {
    const db = read();
    if (type === 'participants' && (id === 'p5' || id.startsWith('p_user_'))) throw new Error('This participant is linked to a User account.');
    if (type === 'events' && (db.registrations.some(r => r.eventId === id) || db.schedules.some(s => s.eventId === id))) {
      throw new Error('Remove this event’s registrations and schedule entries first.');
    }
    if (type === 'participants' && db.registrations.some(r => r.participantId === id)) {
      throw new Error('Remove this participant’s registrations first.');
    }
    const index = db[type].findIndex(item => item.id === id);
    if (index < 0) throw new Error('Record not found.');
    db[type].splice(index, 1);
    persist();
  }
  function ensureDemoUser() {
    const db = read();
    if (!db.participants.some(person => person.id === 'p5')) {
      db.participants.push({id:'p5',fullName:'Jordan Lee',email:'user@example.com',phone:'09195678901',organization:'Guest'});
      persist();
    }
  }
  function ensureSignupParticipant(username, participantId) {
    const db = read();
    if (db.participants.some(person => person.id === participantId)) return;
    db.participants.push({ id: participantId, fullName: username, email: '', phone: '', organization: '' });
    persist();
  }
  window.EventData = { all, get, save, remove, countConfirmed, dateAt, ensureDemoUser, ensureSignupParticipant };
})();
