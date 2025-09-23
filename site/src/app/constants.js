import img from "@/lib/img";
import { FaPaintBrush, FaGamepad,FaTree, FaVolleyballBall, FaCat } from "react-icons/fa";
import { GiPortrait } from "react-icons/gi";


export const smartContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const categories = [
  {
    image: img.Art,
    category: "Art",
    icon: FaPaintBrush,
  },
  {
    image: img.Game,
    category: "Game",
    icon: FaGamepad,
  },
  {
    image: img.Nature,
    category: "Nature",
    icon: FaTree,
  },
  {
    image: img.Sport,
    category: "Sport",
    icon: FaVolleyballBall,
  },
  {
    image: img.Portrait,
    category: "Portrait",
    icon: GiPortrait,
  },
  {
    image: img.Animal,
    category: "Animal",
    icon: FaCat,
  },
];
