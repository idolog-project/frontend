import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Course, RecommendationRequest } from './schemas'
import * as api from './endpoints'

export const keys = {
  idols: (query?: string) => ['idols', query ?? ''] as const,
  allLocations: ['locations', 'all'] as const,
  idolLocations: (idolId: number) => ['idols', idolId, 'locations'] as const,
  location: (locationId: number) => ['locations', locationId] as const,
  savedCourses: ['courses', 'saved'] as const,
}

export const useIdols = (query?: string) =>
  useQuery({ queryKey: keys.idols(query), queryFn: () => api.getIdols(query) })

export const useAllLocations = () =>
  useQuery({ queryKey: keys.allLocations, queryFn: api.getAllLocations })

export const useIdolLocations = (idolId: number | undefined) =>
  useQuery({
    queryKey: keys.idolLocations(idolId!),
    queryFn: () => api.getIdolLocations(idolId!),
    enabled: idolId !== undefined,
  })

export const useLocation = (locationId: number | undefined) =>
  useQuery({
    queryKey: keys.location(locationId!),
    queryFn: () => api.getLocation(locationId!),
    enabled: locationId !== undefined,
  })

export const useSavedCourses = () =>
  useQuery({ queryKey: keys.savedCourses, queryFn: api.getSavedCourses })

/**
 * The slow one — a model call plus map maths, 10-30s.
 *
 * A query, not a mutation, even though the transport is a POST: this screen
 * asks "what are the courses for these conditions", which is a read. Modelling
 * it as a mutation meant firing it by hand from an effect, guarding re-entry
 * with a ref, and betting on a single observer surviving the whole wait — and
 * it did not: the request resolved and the screen never heard about it.
 *
 * As a query the conditions ARE the cache key, so it fires itself, dedupes, and
 * coming back to the same URL reuses the answer instead of waiting again.
 *
 * No retry — a silent second attempt would double an already long wait, and the
 * screen offers an explicit one.
 */
export const useRecommendations = (body: RecommendationRequest | null) =>
  useQuery({
    queryKey: ['recommendations', body] as const,
    queryFn: () => api.getRecommendations(body!),
    enabled: body !== null,
    retry: false,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
  })

export function useSaveCourse(locationId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (course: Course) => api.saveCourse({ locationId, course }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.savedCourses }),
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => api.deleteCourse(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.savedCourses }),
  })
}
