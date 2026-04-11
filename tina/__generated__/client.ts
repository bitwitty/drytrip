import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '4a4e9ecc41cc9bd3328c703bd037778ab2280366', queries,  });
export default client;
  