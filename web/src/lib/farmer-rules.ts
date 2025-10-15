export const canDeleteFarmer = (active: boolean) => !active;

export const ensureInactiveBeforeDelete = (active: boolean) => {
  if (active) {
    throw new Error("ACTIVE_FARMER_CANNOT_BE_DELETED");
  }
};
