import { useParams, useNavigate } from "react-router-dom";
import { usePublicProfile } from "./api/useProfileQueries";

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = usePublicProfile(userId);

  if (isLoading)
    return <div className="p-6 text-center">Wczytywanie profilu...</div>;
  if (isError || !profile)
    return (
      <div className="p-6 text-center text-status-error">
        Nie znaleziono użytkownika.
      </div>
    );

  return (
    <div className="layout-container py-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-accent-primary hover:underline mb-6"
      >
        ← Wróć
      </button>

      <div className="bg-surface-raised border border-border-light rounded-2xl p-8 shadow-md text-center">
        <div className="w-24 h-24 bg-accent-subtle text-accent-primary rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
          {profile.firstName[0]}
          {profile.lastName[0]}
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          {profile.firstName} {profile.lastName}
        </h1>

        {profile.bio && (
          <div className="mt-6 bg-bg-secondary p-4 rounded-xl text-left">
            <h3 className="text-sm font-bold uppercase text-text-muted mb-2">
              O mnie
            </h3>
            <p className="text-text-secondary whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        )}

        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {profile.socialLinks.map(
              (link: { platformName: string; url: string }, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-bg-tertiary border border-border-medium px-4 py-2 rounded-full text-sm font-medium text-accent-primary hover:border-accent-primary transition-colors"
                >
                  {link.platformName}
                </a>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
