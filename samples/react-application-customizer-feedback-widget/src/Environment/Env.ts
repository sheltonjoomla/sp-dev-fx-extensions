import { Web } from "@pnp/sp/presets/all";

const Environment = {
  Site_URL: "https://6j67n3.sharepoint.com/sites/DevSite/",
}

const Sp = Web(Environment.Site_URL);
export { Environment, Sp };
