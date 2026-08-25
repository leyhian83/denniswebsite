/** Personal profile / owner configuration. Edited from config/profile config only. */

export interface SocialLink {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  professionalTitle: string;
  shortBio: string;
  longBio: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  profilePhoto: string;
  company?: string;
  renNumber?: string;
  socials: SocialLink[];
}
