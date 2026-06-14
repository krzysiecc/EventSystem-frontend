import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Wróć
      </button>

      <div className="animate-rise rounded-xl border border-border-light bg-surface-raised p-8 text-center shadow-md">
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-xl bg-accent-subtle text-3xl font-extrabold text-accent-primary">
          {profile.firstName[0]}
          {profile.lastName[0]}
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          {profile.firstName} {profile.lastName}
        </h1>

        {profile.bio && (
          <div className="mt-6 rounded-xl bg-bg-secondary p-4 text-left">
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-text-muted">
              O mnie
            </h3>
            <p className="whitespace-pre-wrap text-text-secondary">
              {profile.bio}
            </p>
          </div>
        )}

        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {profile.socialLinks.map(
              (link: { platformName: string; url: string }, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border-medium bg-bg-tertiary px-4 py-2 text-sm font-medium text-accent-primary transition-colors hover:border-accent-primary"
                >
                  {link.platformName}
                  <ExternalLink size={13} />
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
