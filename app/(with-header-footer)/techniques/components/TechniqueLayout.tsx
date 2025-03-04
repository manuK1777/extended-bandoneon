import { TechniqueText } from './TechniqueText';
import { TechniqueMedia } from './TechniqueMedia';

interface Technique {
  id: number;
  slug: string;
  title: string;
  description: string;
  layout: string;
}

interface Media {
  id: number;
  technique_id: number;
  type: 'image' | 'video';
  url: string;
}

interface TechniqueLayoutProps {
  technique: Technique;
  media: Media[];
}

export const TechniqueLayout = ({ technique, media }: TechniqueLayoutProps) => {
  if (technique.layout === 'standard') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="order-2 lg:order-1">
          <TechniqueText description={technique.description} />
        </div>
        <div className="order-1 lg:order-2">
          <TechniqueMedia media={media} />
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="space-y-8">
      <TechniqueMedia media={media} />
      <TechniqueText description={technique.description} />
    </div>
  );
};
