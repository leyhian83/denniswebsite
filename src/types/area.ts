/** Area / location data model. */

export interface AreaDistrict {
  name: string;
  slug: string;
  description: string;
}

export interface StateGroup {
  state: string;
  slug: string;
  blurb?: string;
  areas: AreaDistrict[];
}

export interface AreaDetail {
  state: string;
  stateSlug: string;
  area: string;
  slug: string;
  description: string;
}
