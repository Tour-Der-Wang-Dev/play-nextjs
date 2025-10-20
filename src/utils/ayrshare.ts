import SocialMediaAPI from "social-media-api";

export type AyrshareClientOptions = {
  profileKey?: string | null;
};

export function getAyrshareClient(opts: AyrshareClientOptions = {}) {
  const apiKey = process.env.AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error("AYRSHARE_API_KEY is not set. Set it in environment variables.");
  }
  const client = new (SocialMediaAPI as any)(apiKey);
  if (opts.profileKey) {
    if (typeof client.setProfileKey === "function") {
      client.setProfileKey(opts.profileKey);
    }
  }
  return client;
}

export function hasAyrshareConfig() {
  return Boolean(process.env.AYRSHARE_API_KEY);
}

export function getAyrsharePrivateKey() {
  return process.env.AYRSHARE_PRIVATE_KEY || "";
}
