import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar"
import {APP_INFO} from "../../lib/constants";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: APP_INFO.title },
    { name: "description", content: "Welcome Floorscape where you can convert 2d floor plans into 3d renders using AI!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);

  const handleUploadComplete = async  (base64Image:string) => {
      try {
          if(isCreatingProjectRef.current) return false;
          isCreatingProjectRef.current = true
          const uniqueID = Date.now().toString();
          const name = `Floorscape plan ${uniqueID}`;

          const newItem = {
              id: uniqueID,
              name,
              sourceImage: base64Image,
              renderedImage: undefined,
              timestamp: Date.now()
          }

          const saved = await createProject({ item: newItem, visibility: "private" });

          if(!saved) {
              console.error(`failed to create project}`)
              return  false
          }

          setProjects((prev) => [saved, ... prev]);

          navigate(`/visualizer/${uniqueID}`, {
              state: {
                  initialImage: saved.sourceImage,
                  initialRender: saved?.renderedImage || null,
                  name
              }
          })

          return true
      } finally {
          isCreatingProjectRef.current = false
      }
  }

    useEffect(() => {
        const fetchProjects = async () => {
            const items = await getProjects();

            if (!items) return;
            setProjects(items)
        }

        void fetchProjects()
    }, []);

  return (
      <div className="home">
        <Navbar />

        <section className="hero">
            <div className="announce">
                <div className="dot">
                    <div className="pulse"></div>
                </div>

                <div className="uppercase">Introducing {APP_INFO.title} 2.0</div>
            </div>

            <h1>Build beautiful spaces at the speed of thought with {APP_INFO.title}</h1>

            <p className="subtitle">
                {APP_INFO.title} is an AI first design environment that helps you visualize, render and
                ship architectural projects faster than ever.
            </p>

            <div className="actions">
                <a href="#upload" className="cta">Start Building <ArrowRight className="icon" /></a>
                <Button variant="outline" className="demo" size="lg">Watch Demo</Button>
            </div>

            <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                <div className="upload-card">
                    <div className="upload-head">
                        <div className="upload-icon">
                            <Layers className="icon" />
                        </div>

                        <h3>Upload your floor plan</h3>
                        <p>Supports JPG, PNG, formats upto 10MB</p>
                    </div>

                    <Upload onComplete={handleUploadComplete}/>
                </div>

            </div>
        </section>

        <section className="projects">
            <div className="section-inner">
                <div className="section-head">
                    <div className="copy">
                        <h2>Projects</h2>
                        <p>Your latest work and shared community projects, all in one place</p>
                    </div>
                </div>

                <div className="projects-grid">
                    {projects.map(({id, name, sourceImage, renderedImage, timestamp}) => (
                        <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                            <div className="preview">
                                <img
                                    src={renderedImage || sourceImage}
                                    alt="Floor preview"
                                />

                                <div className="badge">
                                    <span>community</span>
                                </div>
                            </div>

                            <div className="card-body">
                                <div>
                                    <h3>{name}</h3>
                                    <div className="meta">
                                        <Clock size={12} />
                                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                                        <span>By Jason_21</span>
                                    </div>
                                </div>
                                <div className="arrow">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>


                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>
  );
}
