import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getParentCategories,
  getSubCategories,
} from "../../../../services/apiCategories";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useParentCategories() {
  return useQuery({
    queryKey: ["parent-categories"],
    queryFn: getParentCategories,
  });
}

export function useSubCategories(parentId: string) {
  return useQuery({
    queryKey: ["sub-categories", parentId],
    queryFn: () => getSubCategories(parentId),
    enabled: !!parentId,
  });
}
