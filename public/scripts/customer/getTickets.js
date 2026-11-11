import { getTicketsByShowtimeId } from '../api/tickets.api.js';
import { getSeats } from '../api/seats.api.js';

const selectedTickets = new Map();

const getShowtimeId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('showtimeId');
};

const combineTicketsAndSeats = (tickets, seats) => {
  return tickets.map((ticket) => {
    const seat = seats.find((seat) => seat._id === ticket.seatId);
    if (!seat) {
      throw new Error(`Unable to find seat for ticket ${ticket._id}`);
    }
    return {
      ticketId: ticket._id,
      status: ticket.status,
      section: seat.section,
      row: seat.row,
      seat: seat.seat,
      isWheelchair: seat.isWheelchair
    };
  });
};

const displaySeats = (seating) => {
  const seatsContainer = document.getElementById('seatsContainer');
  seatsContainer.innerHTML = '';
  const screen = document.createElement('div');
  screen.classList.add('screen');
  screen.textContent = 'SCREEN';
  const leftSection = createSeatSection('left', seating);
  const centerSection = createSeatSection('center', seating);
  const rightSection = createSeatSection('right', seating);
  const legend = createSeatLegend();
  seatsContainer.appendChild(screen);
  seatsContainer.appendChild(leftSection);
  seatsContainer.appendChild(centerSection);
  seatsContainer.appendChild(rightSection);
  seatsContainer.appendChild(legend);
};

const createSeatSection = (sectionName, seating) => {
  const section = document.createElement('div');
  section.classList.add('seat-section', `${sectionName}-section`);
  const sectionSeats = seating.filter((ticket) => ticket.section === sectionName);
  const rows = [...new Set(sectionSeats.map((ticket) => ticket.row))].sort((a, b) => a - b);
  rows.forEach((rowNumber) => {
    const row = document.createElement('div');
    row.classList.add('seat-row');
    row.dataset.row = rowNumber;
    const rowSeats = sectionSeats.filter((ticket) => ticket.row === rowNumber).sort((a, b) => a.seat - b.seat);

    rowSeats.forEach((ticket) => {
      const seatElement = document.createElement('button');
      seatElement.classList.add('seat');
      seatElement.classList.add(ticket.status);
      if (ticket.status !== 'available') {
        seatElement.disable = true;
      }
      if (ticket.status === 'available') {
        seatElement.addEventListener('click', () => {
          toggleSeatSelection(seatElement, ticket);
        });
      }
      if (ticket.isWheelchair) {
        seatElement.textContent = 'WC';
        seatElement.classList.add('wheelchair');
      } else {
        const seatIcon = document.createElement('i');
        seatIcon.classList.add('fa-solid', 'fa-couch');
        seatElement.appendChild(seatIcon);
      }
      seatElement.dataset.ticketId = ticket.ticketId;
      seatElement.dataset.section = ticket.section;
      seatElement.dataset.row = ticket.row;
      seatElement.dataset.seat = ticket.seat;
      seatElement.setAttribute('aria-label', `${ticket.section} section, row ${ticket.row}, seat ${ticket.seat}`);
      row.appendChild(seatElement);
    });
    section.appendChild(row);
  });
  return section;
};

const toggleSeatSelection = (seatElement, ticket) => {
  if (selectedTickets.has(ticket.ticketId)) {
    selectedTickets.delete(ticket.ticketId);
    seatElement.classList.remove('selected');
  } else {
    selectedTickets.set(ticket.ticketId, {
      ticketId: ticket.ticketId,
      section: ticket.section,
      row: ticket.row,
      seat: ticket.seat
    });
    seatElement.classList.add('selected');
  }
  displaySelectedSeats();
};

const displaySelectedSeats = () => {
  const ticketSelection = document.getElementById('ticketSelection');
  ticketSelection.innerHTML = '';
  if (selectedTickets.size === 0) {
    return;
  }
  const heading = document.createElement('h2');
  heading.textContent = 'Selected Seats';

  ticketSelection.appendChild(heading);

  selectedTickets.forEach((ticket) => {
    const selectedSeat = document.createElement('p');
    const sectionName = ticket.section.charAt(0).toUpperCase() + ticket.section.slice(1);
    selectedSeat.textContent = `${sectionName} - Row ${ticket.row}, Seat ${ticket.seat}`;
    ticketSelection.appendChild(selectedSeat);
  });
};

const createSeatLegend = () => {
  const legend = document.createElement('div');
  legend.classList.add('legend');

  const legendItems = [
    { label: 'Available', className: 'available', icon: 'couch' },
    { label: 'Selected', className: 'selected', icon: 'couch' },
    { label: 'Reserved', className: 'reserved', icon: 'couch' },
    { label: 'Sold', className: 'sold', icon: 'couch' },
    { label: 'Wheelchair', className: 'wheelchair', icon: 'WC' }
  ];

  legendItems.forEach((item) => {
    const legendItem = document.createElement('div');
    legendItem.classList.add('legend-item');

    const legendSeat = document.createElement('span');
    legendSeat.classList.add('legend-seat', item.className);

    if (item.icon === 'couch') {
      const icon = document.createElement('i');
      icon.classList.add('fa-solid', 'fa-couch');
      legendSeat.appendChild(icon);
    } else {
      legendSeat.textContent = item.icon;
    }
    const label = document.createElement('span');
    label.textContent = item.label;

    legendItem.appendChild(legendSeat);
    legendItem.appendChild(label);
    legend.appendChild(legendItem);
  });
  return legend;
};

const loadTicketsPage = async () => {
  const showtimeId = getShowtimeId();
  if (!showtimeId) {
    document.getElementById('seatsContainer').textContent = 'Invalid showtime selection.';
    return;
  }
  try {
    const tickets = await getTicketsByShowtimeId(showtimeId);
    const seats = await getSeats();
    const seating = combineTicketsAndSeats(tickets, seats);
    displaySeats(seating);
  } catch (error) {
    console.error('Error loading tickets:', error);
    document.getElementById('seatsContainer').textContent = 'Unable to load available seating.';
  }
};

document.addEventListener('DOMContentLoaded', loadTicketsPage);
