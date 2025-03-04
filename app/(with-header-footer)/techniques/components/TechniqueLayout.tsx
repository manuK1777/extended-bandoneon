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
      <div className="grid grid-cols-1 gap-8 container w-[90%] lg:w-[70%] mx-auto">
        <div>
          <TechniqueText description={technique.description} />
        </div>
        <div>
          <TechniqueMedia media={media} />
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="space-y-8">
      <TechniqueText description={technique.description} />
      <TechniqueMedia media={media} />
      
    </div>
  );
};
