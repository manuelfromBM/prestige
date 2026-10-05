import React from "react";
import styles from './BtnWasap.module.css'
import Image from "next/image";


export default function WhatsAppButton() {
    const phone = "56994872535";
    const message = encodeURIComponent("¡Hola! Quiero más información");

    return (
        <a
            href={`https://wa.me/${phone}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fab}
        >
            <Image
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className={styles.icon}
                fill
            />
        </a>
    );
}

