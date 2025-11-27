import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@/services/rooms/rooms.service';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { IGetRoomPromoCodeUsagesRequest, IGetRoomPromoCodeUsagesResponse } from '@/services/rooms/rooms.types';

export function useGetRoomPromoCodeUsages(
  id: string,
  data: Omit<IGetRoomPromoCodeUsagesRequest, 'page'>
) {
  const pageSize = data.size || 5; // Размер страницы по умолчанию

  // Валидация: должен быть указан только один из фильтров - либо eventId, либо sprintId
  const isValid = useMemo(() => {
    const hasEventId = !!data.eventId;
    const hasSprintId = !!data.sprintId;
    // Валидно если не указаны оба фильтра одновременно (можно указать один или ни одного)
    return !(hasEventId && hasSprintId);
  }, [data.eventId, data.sprintId]);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<IGetRoomPromoCodeUsagesResponse>({
    queryKey: [
      QueryKeys.ROOMS,
      id,
      'promo-code-usages',
      data.ambassadorId,
      data.eventId,
      data.sprintId,
      data.dateFrom,
      data.dateTo,
      pageSize,
    ],
    queryFn: ({ pageParam = 1 }) =>
      roomsService.getRoomPromoCodeUsages(id, {
        ...data,
        page: pageParam as number,
        size: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      // Если текущая страница меньше общего количества страниц, возвращаем следующую страницу
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined; // Больше страниц нет
    },
    initialPageParam: 1,
    enabled: !!id && isValid,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  // Объединяем все элементы из всех страниц в один массив
  const items = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page) => page.items);
  }, [infiniteData]);

  // Получаем информацию о пагинации из последней страницы
  const pagination = useMemo(() => {
    if (!infiniteData?.pages || infiniteData.pages.length === 0) return null;
    const lastPage = infiniteData.pages[infiniteData.pages.length - 1];
    return {
      page: lastPage.page,
      size: lastPage.size,
      total: lastPage.total,
      totalPages: lastPage.totalPages,
    };
  }, [infiniteData]);

  return {
    items,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    isValid,
  };
}

