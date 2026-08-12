import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldTopology from "world-atlas/countries-110m.json";

const WIDTH = 960;
const HEIGHT = 500;

const countries = feature(worldTopology, worldTopology.objects.countries);

const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], countries);
const pathGenerator = geoPath(projection);

// A little variety per country so it reads as a real, colorful atlas rather than a flat
// silhouette — cycles through a small palette rather than one color per country.
const LAND_COLORS = ["#6ee7b7", "#5eead4", "#93c5fd", "#86efac", "#7dd3fc"];

export default function WorldMapDots({ points }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full rounded-lg"
      role="img"
      aria-label="Map of visit locations"
    >
      <rect width={WIDTH} height={HEIGHT} fill="#bfdbfe" />
      <g stroke="#0f766e" strokeWidth={0.4} strokeOpacity={0.4}>
        {countries.features.map((f, i) => (
          <path
            key={f.id ?? i}
            d={pathGenerator(f)}
            fill={LAND_COLORS[i % LAND_COLORS.length]}
          />
        ))}
      </g>
      {points.map((p, i) => {
        const coords = projection([p.lng, p.lat]);
        if (!coords) return null;
        const [x, y] = coords;
        return (
          <circle key={i} cx={x} cy={y} r={4.5} fill="#f97316" stroke="#7c2d12" strokeWidth={0.75}>
            <title>{p.label}</title>
          </circle>
        );
      })}
    </svg>
  );
}
