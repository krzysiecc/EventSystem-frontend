import { http, HttpResponse, delay } from "msw";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ======================================================
// 1. SZTUCZNA BAZA DANYCH (W pamięci RAM przeglądarki)
// ======================================================

const mockEvents = [
  {
    id: "evt-101",
    title: "Wielkie Juwenalia Studenckie",
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: "Kampus Główny Politechniki",
    description:
      "<p>Największa impreza w roku! Zapraszamy wszystkich studentów na darmowe koncerty i grille.</p>",
    ticketsSold: 450,
    capacity: 500,
    status: "published",
  },
  {
    id: "evt-102",
    title: "Warsztaty: Wstęp do React i Vite",
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: "Sala Laboratoryjna C-4",
    description:
      "<strong>Przynieś własnego laptopa!</strong> Nauczymy się budować szybkie aplikacje.",
    ticketsSold: 25,
    capacity: 30,
    status: "published",
  },
  {
    id: "evt-103",
    title: "Turniej Szachowy (Faza Grupowa)",
    date: new Date(Date.now() + 86400000 * 20).toISOString(),
    location: "Klub Studencki",
    description: "Zapisy trwają. Główna nagroda to 1000 PLN.",
    ticketsSold: 12,
    capacity: 64,
    status: "draft",
  },
];

const mockTickets = [
  {
    id: "ticket-guid-111",
    eventId: "evt-101",
    eventTitle: "Wielkie Juwenalia Studenckie",
    eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    eventLocation: "Kampus Główny Politechniki",
    isUsed: false,
  },
  {
    id: "ticket-guid-222",
    eventId: "evt-999",
    eventTitle: "Stare wydarzenie",
    eventDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    eventLocation: "Klub",
    isUsed: true,
  },
];

const mockAttendees = [
  {
    id: "ticket-guid-111",
    studentEmail: "jan@student.edu.pl",
    registrationDate: new Date().toISOString(),
    isUsed: false,
  },
  {
    id: "ticket-guid-333",
    studentEmail: "anna@student.edu.pl",
    registrationDate: new Date().toISOString(),
    isUsed: true,
  },
];

export const handlers = [
  // ==========================================
  // 2. AUTH & REFRESH TOKEN
  // ==========================================
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(800);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as any;

    if (body.email && body.password === "password123") {
      // Zwracamy zmockowane tokeny
      // W prawdziwej apce tu by był zdekodowany header z rolą, dla testów frontend wystarczy że token nie jest pusty
      // Backend jwt-decode na froncie wyciąga rolę z tokena.
      // Skoro nasz useAuthStore w Fazie 2 dekoduje JWT, musimy tu zwrócić PRAWIDŁOWY format tokena JWT z odpowiednią rolą!
      // (Dla uproszczenia mockowania - załóżmy, że front przyjmuje rolę z localStorage lub sam token ma stałą strukturę w Mocku)

      // Tworzymy fejkowe JWT (Header.Payload.Signature)
      const mockPayload = btoa(
        JSON.stringify({
          sub: "user-123",
          email: body.email,
          role: body.email.includes("org")
            ? "Organizer"
            : body.email.includes("admin")
              ? "Admin"
              : "Student",
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        }),
      );
      const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockPayload}.signature`;

      return HttpResponse.json({
        accessToken: fakeJwt,
        refreshToken: "mocked-refresh-token",
      });
    }

    return new HttpResponse(
      JSON.stringify({ message: "Nieprawidłowy e-mail lub hasło" }),
      { status: 401 },
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async () => {
    await delay(1000);
    return new HttpResponse(null, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/register-organizer`, async ({ request }) => {
    await delay(1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as any;
    if (body.organizationToken !== "SECRET-ORG-TOKEN") {
      return new HttpResponse(
        JSON.stringify({ message: "Invalid Organization Token." }),
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, async () => {
    await delay(500);
    // Zwracamy nowy zestaw (dla testów wygaśnięcia sesji w custom fetch)
    const mockPayload = btoa(
      JSON.stringify({
        sub: "user-123",
        email: "student@test.com",
        role: "Student",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      }),
    );
    return HttpResponse.json({
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockPayload}.sig`,
      refreshToken: "new-refresh-token",
    });
  }),

  // ==========================================
  // 4. ORGANIZER ENDPOINTS
  // ==========================================
  http.get(`${API_BASE_URL}/events/my-events`, async () => {
    await delay(800);
    return HttpResponse.json(mockEvents);
  }),

  http.get(`${API_BASE_URL}/events/my-events/:id`, async ({ params }) => {
    await delay(500);
    const event = mockEvents.find((e) => e.id === params.id);
    return event
      ? HttpResponse.json(event)
      : new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/events`, async ({ request }) => {
    await delay(1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as any;

    const newEvent = {
      id: `evt-${Date.now()}`,
      title: body.title,
      date: body.date,
      location: body.location,
      description: body.description,
      capacity: Number(body.capacity),
      ticketsSold: 0,
      status: "draft",
    };

    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/events/:id/attendees`, async () => {
    await delay(600);
    return HttpResponse.json(mockAttendees);
  }),

  // ==========================================
  // 3. STUDENT ENDPOINTS
  // ==========================================
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

  http.get(`${API_BASE_URL}/tickets/my-tickets`, async () => {
    await delay(600);
    return HttpResponse.json(mockTickets);
  }),

  http.post(`${API_BASE_URL}/events/:id/register`, async ({ params }) => {
    await delay(1000);
    const event = mockEvents.find((e) => e.id === params.id);
    if (!event || event.ticketsSold >= event.capacity) {
      return new HttpResponse(
        JSON.stringify({ message: "Brak miejsc lub wydarzenie nie istnieje" }),
        { status: 400 },
      );
    }

    // Zwiększamy liczbę sprzedanych biletów w naszej sztucznej bazie
    event.ticketsSold += 1;

    // Dodajemy bilet dla studenta
    mockTickets.push({
      id: `new-ticket-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      isUsed: false,
    });

    return HttpResponse.json({ message: "Zapisano pomyślnie" });
  }),

  // ==========================================
  // 5. SCANNER / TICKET VERIFICATION
  // ==========================================
  http.post(`${API_BASE_URL}/tickets/verify`, async ({ request }) => {
    await delay(600);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as any;

    if (body.ticketId === "ticket-guid-333" || body.ticketId === "12345") {
      return new HttpResponse(
        JSON.stringify({ message: "Bilet został już wykorzystany!" }),
        { status: 400 },
      );
    }
    if (!body.ticketId || body.ticketId.length < 5) {
      return new HttpResponse(
        JSON.stringify({ message: "Nieprawidłowy kod QR." }),
        { status: 400 },
      );
    }

    // Aktualizacja w bazie (manual check-in lub skaner)
    const attendee = mockAttendees.find((a) => a.id === body.ticketId);
    if (attendee) attendee.isUsed = true;

    return HttpResponse.json({ status: "success", message: "Bilet ważny." });
  }),

  // ==========================================
  // 6. ADMIN ENDPOINTS
  // ==========================================
  http.get(`${API_BASE_URL}/admin/users`, async () => {
    await delay(800);
    return HttpResponse.json([
      {
        id: "u1",
        email: "admin@platform.edu",
        role: "Admin",
        isActive: true,
        createdAt: "2023-01-10T12:00:00Z",
      },
      {
        id: "u2",
        email: "org@platform.edu",
        role: "Organizer",
        isActive: true,
        createdAt: "2023-02-15T09:30:00Z",
      },
      {
        id: "u3",
        email: "student@domain.com",
        role: "Student",
        isActive: true,
        createdAt: "2024-05-12T14:20:00Z",
      },
      {
        id: "u4",
        email: "bad.student@domain.com",
        role: "Student",
        isActive: false,
        createdAt: "2024-05-13T10:00:00Z",
      },
    ]);
  }),

  http.get(`${API_BASE_URL}/admin/logs`, async () => {
    await delay(600);
    return HttpResponse.json([
      {
        id: "l1",
        timestamp: new Date().toISOString(),
        level: "Info",
        source: "AuthService",
        message: "User student@domain.com logged in successfully.",
      },
      {
        id: "l2",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: "Warning",
        source: "TicketScanner",
        message: "Repeated scan attempts for used ticket ticket-guid-333.",
      },
      {
        id: "l3",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        level: "Error",
        source: "Database",
        message: "Connection timeout while saving new event.",
      },
    ]);
  }),
];
