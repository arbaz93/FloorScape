import {useNavigate, useOutletContext, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import {APP_INFO} from "../../lib/constants";
import Button from "../../components/ui/Button";
import {createProject, getProjectById} from "../../lib/puter.action";
import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useOutletContext<AuthContext>()

    const hasInitialGenerated = useRef(false)

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null)

    const handleBack = () => navigate("/");

    const handleExport = async () => {
        if (!currentImage) return;

        const filename = `${project?.name || `floorscape-${id || "render"}`}.png`;

        try {
            const response = await fetch(currentImage);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            const link = document.createElement("a");
            link.href = currentImage;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            console.error(error);
        }
    };

    const runGeneration = async (item:DesignItem) => {
        if(!id || !item?.sourceImage) return;
        setIsProcessing(true)
        try {
            const result = await generate3DView({sourceImage:item.sourceImage});

            if(result?.renderedImage) {
                setCurrentImage(result.renderedImage);

                const updatedItem = {
                    ... item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false
                }

                const saved = await createProject({item:updatedItem, visibility: "private"});

                if(saved) {
                    setProject(saved);
                    setCurrentImage(saved.renderedImage || result.renderedImage)
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsProcessing(false)
        }


    }


    useEffect(() => {
        let isMounted = true;
        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }
            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {

        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
            return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading]);


    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo"/>

                    <span className="name">{APP_INFO.title}</span>
                </div>
                <Button className="exit" variant="ghost" size="sm" onClick={handleBack}>
                    <X className="icon" /> Exit Editor
                </Button>
            </nav>

            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{project?.name || `Floorscape ${id}`}</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div className="panel-actions">
                            <Button
                                size="sm"
                                onClick={handleExport}
                                className="export"
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {}}
                                className="share"
                                disabled={!currentImage}
                            >
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                        </div>
                    </div>

                    <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
                        {currentImage
                            ? (<img src={currentImage} alt="AI render" className="render-img "/>)
                            : (<div className="render-placeholder">
                                {project?.sourceImage && (
                                    <img src={project?.sourceImage} alt="original" className="render-placeholder"/>
                                )}
                            </div>)}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Rendering ...</span>
                                    <span className="subtitle">Generating your 3D visualization</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel compare">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Comparison</p>
                            <h3>Before and After</h3>
                        </div>
                        <div className="hint">Drag to compare</div>
                    </div>

                    <div className="compare-stage">
                        {project?.sourceImage && currentImage ? (
                            <ReactCompareSlider
                                defaultValue={50}
                                style={{ width: "100%", background:"#fff" }}
                                itemOne={
                                    <ReactCompareSliderImage
                                        src={project.sourceImage}
                                        alt="before"
                                        className="compare-img"
                                        style={{ width: "100%", height: "auto", objectFit: "contain" }}
                                    />
                                }
                                itemTwo={
                                    <ReactCompareSliderImage
                                        src={currentImage || project?.renderedImage}
                                        alt="after"
                                        className="compare-img"
                                        style={{ width: "100%", height: "auto", objectFit: "contain" }}
                                    />
                                }
                            />
                        ): (
                            <div className="compare-fallback">
                                {project?.sourceImage && (
                                    <img src={project.sourceImage} alt="before" className="compare-img"/>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VisualizerId;
