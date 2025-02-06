import { notFound } from 'next/navigation';

// This would typically come from a database or API
const techniquesData = {
  'opening': {
    name: 'Opening',
    description: 'The opening technique for bandoneon involves...',
    // Add more details as needed
  },
  'closing': {
    name: 'Closing',
    description: 'The closing technique for bandoneon involves...',
    // Add more details as needed
  },
  'bellows-shake': {
    name: 'Bellows Shake',
    description: 'The bellows shake technique involves...',
    // Add more details as needed
  },
};

type Props = {
  params: {
    id: string;
  };
};

export default function TechniquePage({ params }: Props) {
  const technique = techniquesData[params.id as keyof typeof techniquesData];
  
  if (!technique) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{technique.name}</h1>
        <div className="prose prose-invert">
          <p>{technique.description}</p>
        </div>
      </div>
    </main>
  );
}
