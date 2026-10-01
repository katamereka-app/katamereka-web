import LandingPage from "./home-content";
import {
  fetchCategoryFacets,
  fetchCityFacets,
  fetchBusinesses,
  mapApiBusinessToUiModel,
} from "@/lib/api-client";

export default async function Page() {
  const [categoryFacets, cityFacets, popularRes] = await Promise.all([
    fetchCategoryFacets(),
    fetchCityFacets(),
    fetchBusinesses({ limit: 5, sort: "popular" }),
  ]);

  const initialPopularBusinesses =
    popularRes && popularRes.data && Array.isArray(popularRes.data)
      ? popularRes.data.map(mapApiBusinessToUiModel)
      : [];

  return (
    <LandingPage
      initialCategoryFacets={categoryFacets}
      initialCityFacets={cityFacets}
      initialPopularBusinesses={initialPopularBusinesses}
    />
  );
}


