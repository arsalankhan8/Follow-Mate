import { useQuery } from "@tanstack/react-query";
import API from "../lib/api";

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await API.get("/campaigns");
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
