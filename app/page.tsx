import { Header } from "@/components/header";
import { VideoPlayer } from "@/components/video-player";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <VideoPlayer />
      </div>
    </div>
  );
}
