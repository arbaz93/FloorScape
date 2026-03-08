import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar"
import {APP_INFO} from "../../lib/constants";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: APP_INFO.title },
    { name: "description", content: "Welcome Floorscape where you can convert 2d floor plans into 3d renders using AI!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  const handleUploadComplete = async  (base64Image:string) => {
      const uniqueID = Date.now().toString();

      navigate(`/visualizer/${uniqueID}`)

      return true
  }
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
                    <div className="project-card group">
                        <div className="preview">
                            <img
                                src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png"
                                alt="Floor preview"
                            />

                            <div className="badge">
                                <span>community</span>
                            </div>
                        </div>

                        <div className="card-body">
                           <div>
                               <h3>House Plan</h3>
                               <div className="meta">
                                   <Clock size={12} />
                                   <span>{new Date('01.01.2026').toLocaleDateString()}</span>
                                   <span>By Jason_21</span>
                               </div>
                           </div>
                           <div className="arrow">
                               <ArrowUpRight size={18} />
                           </div>
                        </div>


                    </div>
                </div>
            </div>
        </section>
      </div>
  );
}
