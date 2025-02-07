"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faSoundcloud,
  faYoutube,
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";

interface SocialMediaBarProps {
  className?: string;
}

const SocialMediaBar = ({ className = "" }: SocialMediaBarProps) => {
  const iconClass = "w-5 h-5 md:w-6 md:h-6 text-white hover:text-red-500 transition-colors duration-300 mt-4 md:mt-0";

  return (
    <div className={`flex gap-4 md:gap-6 ${className}`}>
      <a
        href="https://instagram.com/your-handle"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <FontAwesomeIcon icon={faInstagram} className={iconClass} />
      </a>
      <a
        href="https://soundcloud.com/your-handle"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <FontAwesomeIcon icon={faSoundcloud} className={iconClass} />
      </a>
      <a
        href="https://youtube.com/your-channel"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <FontAwesomeIcon icon={faYoutube} className={iconClass} />
      </a>
      <a
        href="https://open.spotify.com/artist/your-id"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <FontAwesomeIcon icon={faSpotify} className={iconClass} />
      </a>
    </div>
  );
};

export default SocialMediaBar;
