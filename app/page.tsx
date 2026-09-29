import LandingPage from "./home-content";
import { fetchCategoryFacets, fetchCityFacets } from "@/lib/api-client";

export default async function Page() {
  const [categoryFacets, cityFacets] = await Promise.all([
    fetchCategoryFacets(),
    fetchCityFacets(),
  ]);

  return (
    <LandingPage
      initialCategoryFacets={categoryFacets}
      initialCityFacets={cityFacets}
    />
  );
}
