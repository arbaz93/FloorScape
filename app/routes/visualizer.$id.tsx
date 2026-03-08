import {useLocation, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import {APP_INFO} from "../../lib/constants";
import Button from "../../components/ui/Button";

const VisualizerId = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialImage, initailRender, name } = location.state || {};

    const hasInitialGenerated = useRef(false)

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null)

    const handleBack = () => navigate("/");

    const runGeneration = async () => {
        if(!initialImage) return;
        setIsProcessing(true)
        try {
            const result = await generate3DView({sourceImage:initialImage});

            if(result?.renderedImage) {
                setCurrentImage(result.renderedImage);

                // update the database with the latest 3d image
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsProcessing(false)
        }


    }

    useEffect(() => {
        if(!initialImage || hasInitialGenerated.current) return;

        if(initailRender) {
            setCurrentImage(initailRender);
            hasInitialGenerated.current = true;

            return;
        }

        hasInitialGenerated.current = true;
        runGeneration();
    }, [initialImage, initailRender])
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
                            <h2>Untitled Project</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div className="panel-actions">
                            <Button
                                size="sm"
                                onClick={() => {}}
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
                                {initialImage && (
                                    <img src={initialImage} alt="original" className="render-placeholder"/>
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
            </section>
        </div>
    );
};

export default VisualizerId;