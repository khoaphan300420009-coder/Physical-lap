
export interface OrbitalElements {
    a: number; // Semi-major axis (AU)
    e: number; // Eccentricity
    i: number; // Inclination (deg)
    L: number; // Mean longitude (deg)
    longPeri: number; // Longitude of perihelion (deg)
    node: number; // Longitude of ascending node (deg)
}

export interface PlanetConfig {
    id: string;
    name: string;
    englishName: string;
    type: 'Terrestrial' | 'Gas Giant' | 'Star' | 'Dwarf';
    color: string;
    radiusKM: number; // Real size
    massKG: number;
    orbit: OrbitalElements;
    desc: string;
    texture?: string; // Placeholder for future texture mapping
    image: string;
}

export const PLANETS_DATA: PlanetConfig[] = [
    { 
        id: "sun", name: "Mặt Trời", englishName: "Sun", type: 'Star', color: "#FDB813",
        radiusKM: 696340, massKG: 1.989e30,
        orbit: { a: 0, e: 0, i: 0, L: 0, longPeri: 0, node: 0 },
        desc: "Ngôi sao trung tâm, chiếm 99.8% khối lượng hệ mặt trời.",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070"
    },
    { 
        id: "mercury", name: "Sao Thủy", englishName: "Mercury", type: 'Terrestrial', color: "#A5A5A5",
        radiusKM: 2439, massKG: 3.285e23,
        orbit: { a: 0.387, e: 0.205, i: 7.00, L: 252.25, longPeri: 77.46, node: 48.33 },
        desc: "Hành tinh nhỏ nhất, quỹ đạo có độ lệch tâm lớn nhất.",
        image: "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070"
    },
    { 
        id: "venus", name: "Sao Kim", englishName: "Venus", type: 'Terrestrial', color: "#E3BB76",
        radiusKM: 6051, massKG: 4.867e24,
        orbit: { a: 0.723, e: 0.007, i: 3.39, L: 181.98, longPeri: 131.53, node: 76.68 },
        desc: "Hành tinh nóng nhất do hiệu ứng nhà kính.",
        image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=2070"
    },
    { 
        id: "earth", name: "Trái Đất", englishName: "Earth", type: 'Terrestrial', color: "#22A6B3",
        radiusKM: 6371, massKG: 5.972e24,
        orbit: { a: 1.000, e: 0.017, i: 0.00, L: 100.46, longPeri: 102.94, node: 0 },
        desc: "Hành tinh duy nhất có sự sống được biết đến.",
        image: "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070"
    },
    { 
        id: "mars", name: "Sao Hỏa", englishName: "Mars", type: 'Terrestrial', color: "#EB4D4B",
        radiusKM: 3389, massKG: 6.39e23,
        orbit: { a: 1.524, e: 0.093, i: 1.85, L: 355.45, longPeri: 336.04, node: 49.58 },
        desc: "Hành tinh Đỏ, mục tiêu của sự sống ngoài Trái Đất.",
        image: "https://images.unsplash.com/photo-1614728853975-69c77063ac78?q=80&w=2070"
    },
    { 
        id: "jupiter", name: "Sao Mộc", englishName: "Jupiter", type: 'Gas Giant', color: "#F0932B",
        radiusKM: 69911, massKG: 1.898e27,
        orbit: { a: 5.203, e: 0.048, i: 1.30, L: 34.40, longPeri: 14.75, node: 100.56 },
        desc: "Hành tinh lớn nhất, bảo vệ Trái Đất khỏi thiên thạch.",
        image: "https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=2070"
    },
    { 
        id: "saturn", name: "Sao Thổ", englishName: "Saturn", type: 'Gas Giant', color: "#F1C40F",
        radiusKM: 58232, massKG: 5.683e26,
        orbit: { a: 9.537, e: 0.054, i: 2.49, L: 49.94, longPeri: 92.43, node: 113.72 },
        desc: "Nổi tiếng với hệ thống vành đai lộng lẫy.",
        image: "https://images.unsplash.com/photo-1614732414444-096e6f3a25d6?q=80&w=2070"
    },
    { 
        id: "uranus", name: "Sao Thiên Vương", englishName: "Uranus", type: 'Gas Giant', color: "#7ED6DF",
        radiusKM: 25362, massKG: 8.681e25,
        orbit: { a: 19.191, e: 0.047, i: 0.77, L: 313.23, longPeri: 170.96, node: 74.23 },
        desc: "Hành tinh băng khổng lồ quay ngang.",
        image: "https://images.unsplash.com/photo-1614726365723-49cfa0b86561?q=80&w=2070"
    },
    { 
        id: "neptune", name: "Sao Hải Vương", englishName: "Neptune", type: 'Gas Giant', color: "#30336B",
        radiusKM: 24622, massKG: 1.024e26,
        orbit: { a: 30.069, e: 0.009, i: 1.77, L: 304.88, longPeri: 44.97, node: 131.72 },
        desc: "Nơi có những cơn gió mạnh nhất hệ mặt trời.",
        image: "https://images.unsplash.com/photo-1614728853975-69c77063ac78?q=80&w=2070"
    }
];
