import { http, HttpResponse, delay } from "msw";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ============================================================
// MOCK DATABASE (browser RAM - resets on page reload)
// ============================================================

const mockEvents = [
  {
    id: "evt-101",
    title: "Wielkie Juwenalia Studenckie 2025",
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: "Kampus Główny Politechniki, Plac Grunwaldzki",
    description:
      "<p>Największa impreza roku akademickiego! Zapraszamy wszystkich studentów na darmowe koncerty, grille i zabawy integracyjne. W programie: 3 sceny muzyczne, strefa food truck, konkursy z nagrodami.</p>",
    ticketsSold: 450,
    capacity: 500,
    status: "published",
  },
  {
    id: "evt-102",
    title: "Warsztaty: Wstęp do React i Vite",
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: "Sala Laboratoryjna C-4, Wydział Informatyki",
    description:
      "<p><strong>Przynieś własnego laptopa!</strong> Nauczymy się budować szybkie aplikacje webowe od zera. Poznasz Vite, React Hooks oraz TanStack Query. Poziom: początkujący/średniozaawansowany.</p>",
    ticketsSold: 25,
    capacity: 30,
    status: "published",
  },
  {
    id: "evt-103",
    title: "Turniej Szachowy – Faza Grupowa",
    date: new Date(Date.now() + 86400000 * 20).toISOString(),
    location: "Klub Studencki 'Kwadrant'",
    description:
      "<p>Zapisy trwają! Turniej rozegrany w systemie szwajcarskim. Główna nagroda to 1000 PLN i puchar rektora. Wpisowe 0 zł dla studentów z ważną legitymacją.</p>",
    ticketsSold: 12,
    capacity: 64,
    status: "draft",
  },
  {
    id: "evt-104",
    title: "Noc Filmowa: Klasyki Sci-Fi",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: "Aula Główna, Budynek Rektoratu",
    description:
      "<p>Maraton filmowy od 20:00 do świtu! W repertuarze: Blade Runner 2049, Interstellar, Dune. Wstęp wolny, popcorn w cenie biletu. Poduszki i śpiwory mile widziane.</p>",
    ticketsSold: 88,
    capacity: 120,
    status: "published",
  },
  {
    id: "evt-105",
    title: "Hackathon: AI dla Dobra Społecznego",
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    location: "Centrum Innowacji i Transferu Technologii",
    description:
      "<p>48-godzinny hackathon poświęcony zastosowaniom sztucznej inteligencji w sektorze NGO i pomocy społecznej. Nagrody: 5000, 3000, 1500 PLN. Rejestracja drużynowa (2–5 osób).</p>",
    ticketsSold: 0,
    capacity: 200,
    status: "published",
  },
  {
    id: "evt-106",
    title: "Spotkanie Koła Naukowego: Robotyka",
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: "Sala 3.14, Wydział Mechatroniki",
    description:
      "<p>Prezentacja projektów realizowanych przez członków Koła Naukowego Robotyki. Gość specjalny: dr inż. Marek Kowalski z demonstracją robota mobilnego. Wstęp wolny.</p>",
    ticketsSold: 40,
    capacity: 50,
    status: "published",
  },
];

const mockTickets = [
  {
    id: "ticket-guid-111",
    eventId: "evt-101",
    eventTitle: "Wielkie Juwenalia Studenckie 2025",
    eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    eventLocation: "Kampus Główny Politechniki, Plac Grunwaldzki",
    isUsed: false,
  },
  {
    id: "ticket-guid-444",
    eventId: "evt-104",
    eventTitle: "Noc Filmowa: Klasyki Sci-Fi",
    eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    eventLocation: "Aula Główna, Budynek Rektoratu",
    isUsed: false,
  },
  {
    id: "ticket-guid-222",
    eventId: "evt-999",
    eventTitle: "Warsztaty Git dla Początkujących (zakończone)",
    eventDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    eventLocation: "Sala 101, Biblioteka Główna",
    isUsed: true,
  },
];

const mockAttendees = [
  {
    id: "ticket-guid-111",
    studentEmail: "jan.kowalski@student.edu.pl",
    registrationDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    isUsed: false,
  },
  {
    id: "ticket-guid-333",
    studentEmail: "anna.nowak@student.edu.pl",
    registrationDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    isUsed: true,
  },
  {
    id: "ticket-guid-555",
    studentEmail: "piotr.wisniewski@student.edu.pl",
    registrationDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    isUsed: false,
  },
  {
    id: "ticket-guid-666",
    studentEmail: "marta.zielinska@student.edu.pl",
    registrationDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    isUsed: false,
  },
];

const mockUsers = [
  {
    id: "u1",
    email: "admin@platforma.edu.pl",
    role: "Admin",
    isActive: true,
    createdAt: "2023-01-10T12:00:00Z",
  },
  {
    id: "u2",
    email: "org@platforma.edu.pl",
    role: "Organizer",
    isActive: true,
    createdAt: "2023-02-15T09:30:00Z",
  },
  {
    id: "u3",
    email: "org2@platforma.edu.pl",
    role: "Organizer",
    isActive: true,
    createdAt: "2023-06-01T11:00:00Z",
  },
  {
    id: "u4",
    email: "student@uczelnia.edu.pl",
    role: "Student",
    isActive: true,
    createdAt: "2024-05-12T14:20:00Z",
  },
  {
    id: "u5",
    email: "jan.kowalski@student.edu.pl",
    role: "Student",
    isActive: true,
    createdAt: "2024-05-13T10:00:00Z",
  },
  {
    id: "u6",
    email: "anna.nowak@student.edu.pl",
    role: "Student",
    isActive: true,
    createdAt: "2024-06-01T08:00:00Z",
  },
  {
    id: "u7",
    email: "bad.actor@student.edu.pl",
    role: "Student",
    isActive: false,
    createdAt: "2024-07-20T16:45:00Z",
  },
];

const mockLogs = [
  {
    id: "l1",
    timestamp: new Date().toISOString(),
    level: "Info",
    source: "AuthService",
    message: "User student@uczelnia.edu.pl logged in successfully.",
  },
  {
    id: "l2",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    level: "Info",
    source: "TicketService",
    message:
      "Ticket ticket-guid-444 issued to student@uczelnia.edu.pl for event evt-104.",
  },
  {
    id: "l3",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    level: "Warning",
    source: "TicketScanner",
    message: "Repeated scan attempt for already-used ticket ticket-guid-333.",
  },
  {
    id: "l4",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    level: "Error",
    source: "Database",
    message: "Connection timeout while saving new event evt-105.",
  },
  {
    id: "l5",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    level: "Warning",
    source: "AuthService",
    message:
      "Failed login attempt for unknown@hacker.com (3rd attempt in 5 min).",
  },
  {
    id: "l6",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    level: "Info",
    source: "AdminService",
    message:
      "User bad.actor@student.edu.pl deactivated by admin@platforma.edu.pl.",
  },
];

// ============================================================
// MSW HANDLERS
// ============================================================
export const handlers = [
  // ----------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------

  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as { email: string; password: string };

    if (body.email && body.password === "password123") {
      // Build a fake but structurally valid JWT so jwtDecode works on the frontend
      const role = body.email.includes("org")
        ? "Organizer"
        : body.email.includes("admin")
          ? "Admin"
          : "Student";

      const payload = btoa(
        JSON.stringify({
          sub: `user-${Date.now()}`,
          email: body.email,
          role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        }),
      );
      const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.mock-signature`;

      return HttpResponse.json({
        accessToken: fakeJwt,
        refreshToken: "mocked-refresh-token",
      });
    }

    return new HttpResponse(
      JSON.stringify({ message: "Nieprawidłowy e-mail lub hasło." }),
      { status: 401 },
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async () => {
    await delay(1000);
    return new HttpResponse(null, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/register-organizer`, async ({ request }) => {
    await delay(1000);
    const body = (await request.json()) as { organizationToken?: string };

    if (body.organizationToken !== "SECRET-ORG-TOKEN") {
      return new HttpResponse(
        JSON.stringify({ message: "Nieprawidłowy token organizacyjny." }),
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, async () => {
    await delay(500);
    const payload = btoa(
      JSON.stringify({
        sub: "user-123",
        email: "student@uczelnia.edu.pl",
        role: "Student",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      }),
    );
    return HttpResponse.json({
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.mock-signature`,
      refreshToken: "new-mocked-refresh-token",
    });
  }),

  // ----------------------------------------------------------
  // STUDENT – public events
  // ----------------------------------------------------------

  http.get(`${API_BASE_URL}/events/published`, async () => {
    await delay(600);
    return HttpResponse.json(
      mockEvents.filter((e) => e.status === "published"),
    );
  }),

  http.get(`${API_BASE_URL}/events/:id`, async ({ params }) => {
    await delay(500);
    const event = mockEvents.find((e) => e.id === params.id);
    if (!event) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(event);
  }),

  // ----------------------------------------------------------
  // STUDENT – tickets
  // ----------------------------------------------------------

  http.get(`${API_BASE_URL}/tickets/my-tickets`, async () => {
    await delay(600);
    return HttpResponse.json(mockTickets);
  }),

  http.post(`${API_BASE_URL}/events/:id/register`, async ({ params }) => {
    await delay(1000);
    const event = mockEvents.find((e) => e.id === params.id);

    if (!event) {
      return new HttpResponse(
        JSON.stringify({ message: "Wydarzenie nie istnieje." }),
        { status: 404 },
      );
    }

    if (event.ticketsSold >= event.capacity) {
      return new HttpResponse(
        JSON.stringify({ message: "Brak wolnych miejsc na to wydarzenie." }),
        { status: 400 },
      );
    }

    // Update ticket count in mock DB
    event.ticketsSold += 1;

    // Create and persist a new ticket entry
    const newTicket = {
      id: `ticket-${crypto.randomUUID()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      isUsed: false,
    };
    mockTickets.push(newTicket);

    return HttpResponse.json({ message: "Zapisano pomyślnie." });
  }),

  // ----------------------------------------------------------
  // ORGANIZER – event management
  // ----------------------------------------------------------

  http.get(`${API_BASE_URL}/events/my-events`, async () => {
    await delay(800);
    return HttpResponse.json(mockEvents);
  }),

  http.get(`${API_BASE_URL}/events/my-events/:id`, async ({ params }) => {
    await delay(500);
    const event = mockEvents.find((e) => e.id === params.id);
    if (!event) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(event);
  }),

  http.post(`${API_BASE_URL}/events`, async ({ request }) => {
    await delay(1000);
    const body = (await request.json()) as {
      title: string;
      date: string;
      location: string;
      description: string;
      capacity: number;
    };

    const newEvent = {
      id: `evt-${Date.now()}`,
      title: body.title,
      date: body.date,
      location: body.location,
      description: body.description,
      capacity: Number(body.capacity),
      ticketsSold: 0,
      status: "draft" as const,
    };

    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  // Update an existing event (e.g. publish draft or edit details)
  http.put(`${API_BASE_URL}/events/:id`, async ({ params, request }) => {
    await delay(800);
    const index = mockEvents.findIndex((e) => e.id === params.id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as Partial<(typeof mockEvents)[0]>;
    mockEvents[index] = { ...mockEvents[index], ...body };

    return HttpResponse.json(mockEvents[index]);
  }),

  // Delete an event (organizer only)
  http.delete(`${API_BASE_URL}/events/:id`, async ({ params }) => {
    await delay(700);
    const index = mockEvents.findIndex((e) => e.id === params.id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockEvents.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ----------------------------------------------------------
  // ORGANIZER – attendees & check-in
  // ----------------------------------------------------------

  http.get(`${API_BASE_URL}/events/:id/attendees`, async () => {
    await delay(600);
    return HttpResponse.json(mockAttendees);
  }),

  // ----------------------------------------------------------
  // SCANNER / TICKET VERIFICATION (used by both QRScanner and manual check-in)
  // ----------------------------------------------------------

  http.post(`${API_BASE_URL}/tickets/verify`, async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      ticketId: string;
      eventId?: string;
    };

    if (!body.ticketId || body.ticketId.length < 5) {
      return new HttpResponse(
        JSON.stringify({ message: "Nieprawidłowy identyfikator biletu." }),
        { status: 400 },
      );
    }

    // Check against attendees list first
    const attendee = mockAttendees.find((a) => a.id === body.ticketId);
    if (attendee) {
      if (attendee.isUsed) {
        return new HttpResponse(
          JSON.stringify({ message: "Bilet został już wykorzystany!" }),
          { status: 400 },
        );
      }
      // Mark as used
      attendee.isUsed = true;
      return HttpResponse.json({
        status: "success",
        message: "Bilet ważny. Wejście zatwierdzone.",
      });
    }

    // Also check mockTickets (for tickets not yet in attendees list)
    const ticket = mockTickets.find((t) => t.id === body.ticketId);
    if (ticket) {
      if (ticket.isUsed) {
        return new HttpResponse(
          JSON.stringify({ message: "Bilet został już wykorzystany!" }),
          { status: 400 },
        );
      }
      ticket.isUsed = true;
      return HttpResponse.json({
        status: "success",
        message: "Bilet ważny. Wejście zatwierdzone.",
      });
    }

    return new HttpResponse(
      JSON.stringify({ message: "Nie znaleziono biletu w systemie." }),
      { status: 404 },
    );
  }),

  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  http.get(`${API_BASE_URL}/admin/users`, async () => {
    await delay(800);
    return HttpResponse.json(mockUsers);
  }),

  // Toggle user active status (block/unblock)
  http.patch(`${API_BASE_URL}/admin/users/:id`, async ({ params, request }) => {
    await delay(600);
    const index = mockUsers.findIndex((u) => u.id === params.id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as Partial<(typeof mockUsers)[0]>;
    mockUsers[index] = { ...mockUsers[index], ...body };

    return HttpResponse.json(mockUsers[index]);
  }),

  http.get(`${API_BASE_URL}/admin/logs`, async () => {
    await delay(600);
    return HttpResponse.json(mockLogs);
  }),
];
