export const findPlayerById = (players: any[], id: string | number | undefined | null) => {
  if (id === undefined || id === null) return undefined;
  const strId = String(id).trim();
  
  // 1. Try exact Match
  let found = players.find(p => String(p.id).trim() === strId);
  if (found) return found;

  // 2. Try normalized Match (stripping any 'ply_' prefix)
  const normId = strId.replace(/^ply_/, '');
  found = players.find(p => {
    const pIdStr = String(p.id).trim();
    return pIdStr === normId || pIdStr.replace(/^ply_/, '') === normId;
  });

  return found;
};
