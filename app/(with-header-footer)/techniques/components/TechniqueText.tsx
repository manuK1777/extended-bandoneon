interface TechniqueTextProps {
  description: string;
}

export const TechniqueText = ({ description }: TechniqueTextProps) => {
  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, index) => {
      // Check if the block starts with a heading marker (#)
      if (block.trim().startsWith("# ")) {
        const headingText = block.trim().substring(2);
        return (
          <h2 key={index} className="text-mdl font-bold text-fuchsia-200 mt-6 mb-4 font-heading">
            {headingText}
          </h2>
        );
      }
      
      return (
        <p key={index} className="text-body mb-3 text-gray-200">
          {block.trim()}
        </p>
      );
    });
  };

  return (
    <div className="prose prose-invert max-w-none">
      {renderContent(description)}
    </div>
  );
};
