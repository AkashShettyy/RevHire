import Organization from "../models/Organization.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAccessibleOrganizationIds(organizationId) {
  if (!organizationId) {
    return [];
  }

  const currentOrganization = await Organization.findById(organizationId).lean();
  if (!currentOrganization?.name) {
    return [organizationId.toString()];
  }

  const sameNameOrganizations = await Organization.find({
    name: {
      $regex: `^${escapeRegex(currentOrganization.name.trim())}$`,
      $options: "i",
    },
  })
    .select("_id")
    .lean();

  if (sameNameOrganizations.length === 0) {
    return [organizationId.toString()];
  }

  return sameNameOrganizations.map((organization) => organization._id.toString());
}

export async function canAccessOrganization(organizationId, userOrganizationId) {
  if (!organizationId || !userOrganizationId) {
    return false;
  }

  const accessibleOrganizationIds = await getAccessibleOrganizationIds(userOrganizationId);
  return accessibleOrganizationIds.includes(organizationId.toString());
}
