import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import Navbar from "../../components/Navbar";
import {APP_INFO, PUTER_WORKER_URL} from "../../lib/constants";
import type { Route } from "./+types/community";
import puter from "@heyputer/puter.js";

type ApiProjectsResponse = {
  projects?: DesignItem[] | null;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${APP_INFO.title} | Community` },
    {
      name: "description",
      content: `Discover public ${APP_INFO.title} projects shared by the community.`,
    },
  ];
}

export default function CommunityRoute() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      try {
        // Use the public-only endpoint so we don't depend on user authentication
        // when rendering the community page.
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/public`, { method: "GET" });

        const data = (await response.json()) as ApiProjectsResponse;
        const publicProjects = Array.isArray(data?.projects)
          ? data.projects.filter((project) => project?.isPublic)
          : [];

        if (!cancelled) setProjects(publicProjects);
      } catch (err) {

        if (!cancelled) setError("Unable to load community projects right now.");
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleNavigate = (payload:DesignItem) => {
    if(!payload?.id) return;

    navigate(`/visualizer/${payload.id}`, {
          state: {
            ...payload,
            comingFrom: "community"
          }
        }
        )
  }
  const hasResults = useMemo(() => projects.length > 0, [projects]);

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <div className="uppercase">Community Showcase</div>
        </div>

        <h1>Explore shared {APP_INFO.title} projects</h1>

        <p className="subtitle">
          Browse renders made public by designers. Click any project to inspect it in the
          visualizer.
        </p>

        <div className="actions">
          <div className="cta inline-flex items-center gap-2">
            <Users className="icon" size={18} />
            Community Curated
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Public Projects</h2>
              <p>All items shown below are marked public by their creators.</p>
            </div>
          </div>

          {isLoading && <div className="loading">Loading community projects…</div>}
          {error && !isLoading && <div className="loading text-red-500">{error}</div>}

          {!isLoading && !error && (
            <div className="projects-grid">
              {hasResults ? (
                projects.map(({ id, name, sourceImage, renderedImage, timestamp, sharedBy, ownerId }) => (
                  <div
                    key={id}
                    className="project-card group"
                    onClick={(payload) => handleNavigate({ id, name, sourceImage, renderedImage, timestamp, sharedBy, ownerId  })}
                  >
                    <div className="preview">
                      <img src={renderedImage || sourceImage} alt="Floor preview" />

                      <div className="badge">
                        <span>community</span>
                      </div>
                    </div>

                    <div className="card-body">
                      <div>
                        <h3>{name || `Project ${id}`}</h3>
                        <div className="meta">
                          <Clock size={12} />
                          <span>{new Date(timestamp).toLocaleDateString()}</span>
                          <span>{sharedBy ? `By ${sharedBy}` : "Anonymous"}</span>
                        </div>
                      </div>
                      <div className="arrow">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">No public projects yet. Share your first render!</div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
