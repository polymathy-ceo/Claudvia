"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("motion-ready");

    const elements = document.querySelectorAll<HTMLElement>(
      ".hero__copy, .hero__visual, .hero__bottomline, .intro-grid > *, .section-heading, .principle-card, .ecosystem-preview__copy, .status-list__item, .update-card, .newsletter-panel > *"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    elements.forEach((element, index) => {
      element.setAttribute("data-reveal", "");
      element.style.setProperty(
        "--reveal-delay",
        `${(index % 4) * 75}ms`
      );
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
