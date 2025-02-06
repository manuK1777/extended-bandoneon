"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faSoundcloud,
  faYoutube,
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";

interface SocialMediaBarProps {
  className?: string;
}

const SocialMediaBar = ({ className = "" }: SocialMediaBarProps) => {
  return (
    <motion.div 
      className={`flex gap-6 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 2 }}
    >
      <a
        href="https://instagram.com/your-handle"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-red-500 transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faInstagram} className="w-6 h-6" />
      </a>
      <a
        href="https://soundcloud.com/your-handle"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-red-500 transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faSoundcloud} className="w-6 h-6" />
      </a>
      <a
        href="https://youtube.com/@your-handle"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-red-500 transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faYoutube} className="w-6 h-6" />
      </a>
      <a
        href="https://open.spotify.com/artist/your-id"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-red-500 transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faSpotify} className="w-6 h-6" />
      </a>
    </motion.div>
  );
};

export default SocialMediaBar;
