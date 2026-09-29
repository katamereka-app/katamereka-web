import LandingPage from "./home-content";
import { fetchCategoryFacets, fetchCityFacets } from "@/lib/api-client";

export default async function Page() {
  const [categoryFacets, cityFacets] = await Promise.all([
    fetchCategoryFacets(),
    fetchCityFacets(),
  ]);

  return (
    <LandingPage
      initialCategoryFacets={categoryFacets.slice(0, 10)}
      initialCityFacets={cityFacets.slice(0, 10)}
    />
  );
}
