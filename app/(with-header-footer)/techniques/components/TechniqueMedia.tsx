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
        <div key={video.id} style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
          <iframe
            src={video.url}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
            title="Technique Video"
            className="rounded-lg"
          />
        </div>
      ))}
    </div>
  );
};
