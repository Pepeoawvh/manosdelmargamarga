import { 
  Montserrat, 
  Jost, 
  Questrial, 
  Roboto, 
  Bebas_Neue, 
  Abel,
  Lexend_Deca,
  Red_Hat_Display,
  Fleur_De_Leah,
  Tangerine,
  Ephesis
} from "next/font/google";

export const montserrat = Montserrat({ subsets: ["latin"] });

export const roboto = Roboto({ subsets: ["latin"], weight: "500" });

export const jost = Jost({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const questrial = Questrial({
  weight: ["400"],
  subsets: ["latin"],
});
export const bebas = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
});
export const abel = Abel({
  weight: ["400"],
  subsets: ["latin"],
});
export const lexend = Lexend_Deca({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const redHat = Red_Hat_Display({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const fleurDeLeah = Fleur_De_Leah({
  weight: ["400"],
  subsets: ["latin"],
});

export const tangerine = Tangerine({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const ephesis = Ephesis({
  weight: ["400"],
  subsets: ["latin"],
});
