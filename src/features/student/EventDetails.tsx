import { useParams, Link, useNavigate } from "react-router-dom";
import { useEventDetails, useRegisterForEvent } from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";
import { useQueryClient } from "@tanstack/react-query";

const EventDetailsStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const eventId = id ? Number(id) : undefined;
  const { data: event, isLoading, isError } = useEventDetails(eventId);
  const registerMutation = useRegisterForEvent();

  if (isLoading) return <div className="p-6 text-center">Ładowanie szczegółów...</div>;
  if (isError || !event) return <div className="p-6 text-red-500 text-center">Nie znaleziono wydarzenia.</div>;

  const handleRegister = () => {
    if (!eventId) return;
    
    registerMutation.mutate(eventId, {
      onSuccess: () => {
        addToast("Zapisano pomyślnie! Bilet znajduje się w Twoim panelu.", "success");
        // Inwalidujemy listę wydarzeń, żeby odświeżyć miejsca na głównym ekranie
        queryClient.invalidateQueries({ queryKey: ["student", "events"] });
        navigate("/student/tickets");
      },
      onError: (error: any) => {
        addToast(error.message || "Błąd podczas rejestracji.", "error");
      },
    });
  };

  const sold = event.ticketsSold ?? 0;
  const capacity = event.maxCapacity ?? 0;
  const remainingSeats = capacity - sold;
  const isFull = capacity > 0 && remainingSeats <= 0;

  return (
    <div className="layout-container py-6 max-w-3xl">
      <Link to="/student/events" className="text-indigo-600 hover:underline mb-6 inline-block">
        ← Wróć do listy
      </Link>
      
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 py-6 border-y">
          <div>
            <span className="block text-xs uppercase font-bold text-gray-400">Data</span>
            <span className="font-medium">{new Date(event.date).toLocaleString("pl-PL")}</span>
          </div>
          <div>
            <span className="block text-xs uppercase font-bold text-gray-400">Lokalizacja</span>
            <span className="font-medium">{event.location}</span>
          </div>
          <div>
            <span className="block text-xs uppercase font-bold text-gray-400">Dostępność</span>
            <span className={`font-medium ${isFull ? "text-red-500" : "text-green-600"}`}>
              {remainingSeats} / {capacity} wolnych miejsc
            </span>
          </div>
        </div>

        <div className="prose max-w-none mb-10">
          <h3 className="text-xl font-bold mb-2">O wydarzeniu</h3>
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>

        <button
          onClick={handleRegister}
          disabled={isFull || registerMutation.isPending}
          className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          {registerMutation.isPending ? "Generowanie..." : isFull ? "Brak miejsc" : "Odbierz darmowy bilet"}
        </button>
      </div>
    </div>
  );
};

export default EventDetailsStudent;