export const getPagination = (page = 1, limit = 10) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
  const take = Math.min(safeLimit, 100);
  const skip = (safePage - 1) * take;
  return { take, skip };
};

export const buildMeta = (total: number, page: number, limit: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
