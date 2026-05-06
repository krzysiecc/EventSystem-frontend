import { http, HttpResponse, delay } from "msw";
import type { OrganizerEvent } from "@/features/organizer/api/useEvents";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const handlers = [
  /**
   * @description Mock for user login.
   * Expects an email and password.
   */
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email && body.password === "password123") {
      return HttpResponse.json({
        accessToken: "mocked.jwt.token",
        refreshToken: "mocked-refresh-token",
      });
    }

    return new HttpResponse(
      JSON.stringify({ message: "Wrong e-mail or password" }),
      { status: 401 },
    );
  }),

  /**
   * @description Mock for fetching organizer's events.
   * Simulates a delay and returns a list of events with various statuses (draft, published).
   */
  http.get(`${API_BASE_URL}/events/my-events`, async () => {
    await delay(1000);

    const mockedEvents: OrganizerEvent[] = [
      {
        id: "evt-101",
        title: "Juwenalia Wrocławskie",
        date: new Date(Date.now() + 86400000 * 10).toISOString(),
        location: "Kampus Główny Politechniki",
        ticketsSold: 450,
        capacity: 500,
        status: "published",
      },
      {
        id: "evt-102",
        title: "Warsztaty: wstęp do Reacta",
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
        location: "Budynek C-3, sala 1.28",
        ticketsSold: 25,
        capacity: 30,
        status: "published",
      },
      {
        id: "evt-103",
        title: "Turniej Szachistów Wrocławskich (faza grupowa)",
        date: new Date(Date.now() + 86400000 * 20).toISOString(),
        location: "Klub Studencki Bajer",
        ticketsSold: 12,
        capacity: 64,
        status: "draft",
      },
    ];

    return HttpResponse.json(mockedEvents);
  }),

  /**
   * @description Mock for Organizer Registration.
   * Expects a specific mock token "SECRET-ORG-TOKEN" to simulate successful validation.
   */
  http.post(`${API_BASE_URL}/auth/register-organizer`, async ({ request }) => {
    await delay(1000);
    const body = await request.json() as { organizationToken?: string };

    if (body.organizationToken !== "SECRET-ORG-TOKEN") {
      return new HttpResponse(
        JSON.stringify({ message: "Invalid Organization Token." }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new HttpResponse(null, { status: 201 });
  }),
];
