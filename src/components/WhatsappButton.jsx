import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "../templates/styles/Whatsapp.css";

const WhatsappButton = ({ phone = "51917361031", mensaje = "Hola, necesito ayuda." }) => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
    >
      <FaWhatsapp size={32} className="whatsapp-icon" />
    </a>
  );
};

export default WhatsappButton;