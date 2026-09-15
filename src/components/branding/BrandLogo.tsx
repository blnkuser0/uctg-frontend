import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "landscape" | "portrait" | "square";
  className?: string;
  priority?: boolean;
};

const logoSources = {
  landscape: {
    src: "/assets/branding/logo-landscape.jpg",
    darkSrc: "/assets/branding/logo-landscape-dark.webp",
    width: 1500,
    height: 500,
  },
  portrait: {
    src: "/assets/branding/logo-portrait.jpg",
    darkSrc: "/assets/branding/logo-portrait-dark.webp",
    width: 1000,
    height: 1000,
  },
  square: {
    src: "/assets/branding/logo-square.jpg",
    darkSrc: "/assets/branding/logo-square-dark.webp",
    width: 922,
    height: 802,
  },
};

export function BrandLogo({ variant = "square", className, priority = false }: BrandLogoProps) {
  const logo = logoSources[variant];

  return (
    <>
      <Image
        src={logo.src}
        alt="Ugnexa Catalyst"
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={cn("object-contain dark:hidden", className)}
      />
      <Image
        src={logo.darkSrc}
        alt="Ugnexa Catalyst"
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  );
}
