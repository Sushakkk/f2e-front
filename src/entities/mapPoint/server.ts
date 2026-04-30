export type MapPointServer = {
  id: number;
  name: string;
  city: string;
  address: string;
  metro: string;
  lat: string | number | null;
  lng: string | number | null;
  image: string;
  halls_count: number;
  active_courses_count: number;
  dance_styles: string[];
};

export type MapPointsResponseServer = MapPointServer[];
