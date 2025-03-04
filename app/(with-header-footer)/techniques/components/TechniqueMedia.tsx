interface Media {
  id: number;
  technique_id: number;
  type: 'image' | 'video';
  url: string;
}

interface TechniqueMediaProps {
  media: Media[];
}

export const TechniqueMedia = ({ media }: TechniqueMediaProps) => {
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  return (
    <div className="space-y-6">
      {/* Images */}
      {images.map((img, idx) => (
        <div key={img.id} className="relative aspect-video">
          <img
            src={img.url}
            alt={`Technique image ${idx + 1}`}
            className="rounded-lg object-cover w-full h-full"
          />
        </div>
      ))}

      {/* Videos */}
      {videos.map((video) => (
        <div key={video.id} className="relative aspect-video">
          <iframe
            src={video.url}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
};
