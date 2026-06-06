import { useParams, useSearchParams } from "react-router-dom";
import { usePublicProfile } from "../student/api/useUserQueries";

const PublicProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const isGenericProfile = id === "unknown" || !id;

  const { data: profile, isLoading, isError } = usePublicProfile(isGenericProfile ? undefined : id);

  if (isLoading) return <div className="p-10 text-center">Ładowanie profilu...</div>;
  if (!profile && !isGenericProfile) return <div className="p-10 text-center text-red-500">Nie znaleziono profilu.</div>;

  return (
    <div className="layout-container py-10 max-w-md mx-auto">
      <div className="bg-white border p-8 rounded-2xl shadow-lg text-center">
        {isGenericProfile ? (
          <>
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              ?
            </div>
            <h1 className="text-2xl font-bold">Profil uczestnika</h1>
            <p className="text-gray-600 italic my-4">Brak szczegółowych danych użytkownika w tym QR.</p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {profile?.firstName?.[0] || "U"}{profile?.lastName?.[0] || ""}
            </div>
            <h1 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h1>
            <p className="text-gray-600 italic my-4">{profile?.bio || "Brak opisu."}</p>

            <div className="flex justify-center gap-2 flex-wrap">
              {profile?.socialLinks?.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {link.platformName}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs uppercase text-gray-400">Status uczestnika</p>
          <div className="mt-2 font-bold text-indigo-600">Bilet #{ticketId || "Networking"}</div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileView;